import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * GET /api/admin/pedidos?estado=pendiente_confirmacion
 *
 * Lista pedidos para el panel de administración.
 * Requiere header: Authorization: Bearer <ADMIN_TOKEN>
 */
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization") ?? "";
  const adminToken = process.env.ADMIN_TOKEN;

  if (!adminToken || authHeader !== `Bearer ${adminToken}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const filtroEstado = searchParams.get("estado");

  const supabase = supabaseAdmin();
  let query = supabase
    .from("pedidos")
    .select("*")
    .order("created_at", { ascending: false });

  if (filtroEstado) {
    query = query.eq("estado", filtroEstado);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ pedidos: data ?? [] });
}
