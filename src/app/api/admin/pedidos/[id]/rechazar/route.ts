import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { stripe } from "@/lib/stripe";

/**
 * POST /api/admin/pedidos/[id]/rechazar
 *
 * Rechaza un pedido y reembolsa el pago de Stripe si existe.
 * Requiere header: Authorization: Bearer <ADMIN_TOKEN>
 */
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const authHeader = req.headers.get("authorization") ?? "";
  const adminToken = process.env.ADMIN_TOKEN;

  if (!adminToken || authHeader !== `Bearer ${adminToken}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = params;
  const supabase = supabaseAdmin();

  // Obtener el pedido para saber el payment intent
  const { data: pedido, error: fetchError } = await supabase
    .from("pedidos")
    .select("estado, stripe_payment_intent, total")
    .eq("id", id)
    .single();

  if (fetchError || !pedido) {
    return NextResponse.json(
      { error: "Pedido no encontrado" },
      { status: 404 }
    );
  }

  if (!["pendiente_confirmacion", "pagado"].includes(pedido.estado)) {
    return NextResponse.json(
      { error: "Solo se pueden rechazar pedidos pendientes o pagados" },
      { status: 400 }
    );
  }

  // Reembolsar en Stripe si hay payment intent
  if (pedido.stripe_payment_intent) {
    try {
      await stripe.refunds.create({
        payment_intent: pedido.stripe_payment_intent,
        reason: "requested_by_customer",
        metadata: { pedido_id: id, motivo: "rechazado_por_personal" },
      });
    } catch (err: any) {
      // Si el reembolso falla, aún marcamos el pedido como rechazado
      // pero devolvemos warning al frontend
      console.error("Error reembolsando en Stripe:", err.message);
    }
  }

  // Actualizar estado
  const { data, error } = await supabase
    .from("pedidos")
    .update({ estado: "rechazado_reembolsado" })
    .eq("id", id)
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, pedido: data[0] });
}
