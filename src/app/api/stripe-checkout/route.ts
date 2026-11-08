import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { stripe } from "@/lib/stripe";

/**
 * POST /api/stripe-checkout
 *
 * Crea una sesión de Stripe Checkout con los precios ya validados por n8n
 * (unit_cents). Guarda el stripe_session_id en la tabla pedidos para poder
 * relacionar el pago con el pedido cuando Stripe devuelva el webhook.
 *
 * Body esperado:
 * {
 *   pedidoId: string,
 *   items: [{ id, nombre, unit_cents, qty, subtotal_cents }],
 *   totalCents: number,
 *   tipo: "mesa" | "domicilio",
 *   mesaId?: number | null,
 *   cliente?: { nombre, telefono, direccion }
 * }
 */
export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Cuerpo JSON inválido" },
      { status: 400 }
    );
  }

  const { pedidoId, items, totalCents, tipo, mesaId, cliente } = body;

  if (!pedidoId || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json(
      { error: "Datos insuficientes para crear la sesión de pago" },
      { status: 400 }
    );
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: items.map((it: any) => ({
        price_data: {
          currency: "eur",
          product_data: {
            name: it.nombre || it.id,
            metadata: { producto_id: it.id, tipo },
          },
          unit_amount: Math.round(it.unit_cents),
        },
        quantity: it.qty,
      })),
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/pedido-exitoso?id=${pedidoId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/carrito?id=${pedidoId}`,
      metadata: {
        pedido_id: pedidoId,
        tipo,
        mesa_id: String(mesaId ?? ""),
        cliente_nombre: cliente?.nombre ?? "",
        cliente_telefono: cliente?.telefono ?? "",
        direccion: cliente?.direccion ?? "",
      },
    });

    // Guardar el id de sesión de Stripe en la tabla pedidos
    const supabase = supabaseAdmin();
    const { error: updError } = await supabase
      .from("pedidos")
      .update({ stripe_session_id: session.id })
      .eq("id", pedidoId);

    if (updError) {
      // No fallamos el pago por esto, pero lo registramos
      console.error("No se pudo guardar stripe_session_id:", updError.message);
    }

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Error creando sesión de Stripe" },
      { status: 500 }
    );
  }
}
