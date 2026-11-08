import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * POST /api/webhooks/stripe
 *
 * Webhook de Stripe. Cuando el cliente completa el pago en Checkout,
 * Stripe nos notifica y marcamos el pedido como 'pendiente_confirmacion'.
 *
 * Configurar en Stripe Dashboard → Developers → Webhooks:
 *   Endpoint: https://tu-dominio.com/api/webhooks/stripe
 *   Eventos: checkout.session.completed, charge.refunded
 *
 * Seguridad:
 *   - Verifica la firma con STRIPE_WEBHOOK_SECRET
 *   - Usa req.text() (body crudo), no req.json()
 *   - Usa SUPABASE_SERVICE_ROLE_KEY (escribe sin usuario autenticado)
 *   - Idempotencia: tabla webhook_events evita procesar dos veces
 *   - Siempre responde 200 aunque falle internamente (Stripe reintenta 3 días si no)
 */
export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get("stripe-signature") ?? "";

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    // Si no hay secreto, respondemos 200 para evitar reintentos de Stripe,
    // pero logueamos el error para que el administrador lo vea.
    console.error("STRIPE_WEBHOOK_SECRET no configurado");
    return NextResponse.json({ received: true }, { status: 200 });
  }

  let event: any;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json(
      { error: `Webhook error: ${err.message}` },
      { status: 400 }
    );
  }

  const eventId = event.id;

  try {
    const supabase = supabaseAdmin();

    // --- IDempotencia: verificar si ya procesamos este evento ---
    const { data: existente } = await supabase
      .from("webhook_events")
      .select("id")
      .eq("id", eventId)
      .single();

    if (existente) {
      // Ya lo procesamos, responder 200 para que Stripe no reintente
      return NextResponse.json({ received: true, duplicate: true }, { status: 200 });
    }

    // --- Procesar evento ---
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as any;
      const pedidoId = session.metadata?.pedido_id;
      const paymentIntent = session.payment_intent as string | null;

      if (pedidoId) {
        // Marcar pedido como pagado y listo para confirmar por el personal
        await supabase
          .from("pedidos")
          .update({
            estado: "pendiente_confirmacion",
            stripe_payment_intent: paymentIntent ?? null,
            pagado_at: new Date().toISOString(),
          })
          .eq("id", pedidoId)
          .in("estado", ["pendiente_pago", "pendiente_confirmacion"]);
      }
    }

    if (event.type === "charge.refunded") {
      const charge = event.data.object as any;
      const paymentIntent = charge.payment_intent as string | null;

      if (paymentIntent) {
        await supabase
          .from("pedidos")
          .update({ estado: "rechazado_reembolsado" })
          .eq("stripe_payment_intent", paymentIntent);
      }
    }

    // --- Registrar evento procesado (idempotencia) ---
    await supabase.from("webhook_events").insert({
      id: eventId,
      tipo: event.type,
      pedido_id:
        event.type === "checkout.session.completed"
          ? (event.data.object as any).metadata?.pedido_id ?? null
          : null,
      payload: event.data.object,
    });

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err: any) {
    // Loguear pero responder 200 para que Stripe no reintente indefinidamente.
    // El evento quedará sin registrar en webhook_events, así que si se reintenta
    // se volverá a intentar procesar. Eso es aceptable para eventos críticos.
    console.error("Error procesando webhook de Stripe:", err.message);
    return NextResponse.json({ received: true }, { status: 200 });
  }
}
