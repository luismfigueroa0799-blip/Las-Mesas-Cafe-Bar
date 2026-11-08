import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * POST /api/admin/pedidos/[id]/confirmar
 *
 * El personal del bar confirma un pedido pendiente y lo pasa a cocina.
 * Requiere header: Authorization: Bearer <ADMIN_TOKEN>
 *
 * Body: { estado: "preparando" }  (por defecto "preparando")
 */
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  // Protección simple: token de admin por variable de entorno
  const authHeader = req.headers.get("authorization") ?? "";
  const adminToken = process.env.ADMIN_TOKEN;

  if (!adminToken || authHeader !== `Bearer ${adminToken}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = params;
  let body: any;
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const nuevoEstado = body.estado ?? "preparando";

  if (!["preparando", "entregado", "cancelado"].includes(nuevoEstado)) {
    return NextResponse.json(
      { error: "Estado inválido" },
      { status: 400 }
    );
  }

  const supabase = supabaseAdmin();
  const { data, error } = await supabase
    .from("pedidos")
    .update({ estado: nuevoEstado })
    .eq("id", id)
    .in("estado", ["pendiente_confirmacion", "pagado"])
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data || data.length === 0) {
    return NextResponse.json(
      { error: "Pedido no encontrado o no está en estado confirmable" },
      { status: 404 }
    );
  }

  return NextResponse.json({ ok: true, pedido: data[0] });
}
