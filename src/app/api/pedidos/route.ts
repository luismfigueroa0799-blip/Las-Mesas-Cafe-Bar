import { NextResponse } from "next/server";

/**
 * POST /api/pedidos
 *
 * Punto de entrada del frontend. NO recalcula precios ni valida tokens:
 * eso lo hace n8n (middleware de confianza). Esta ruta solo reenvía el
 * payload al webhook de n8n y devuelve su respuesta al cliente.
 *
 * Body esperado:
 * {
 *   mesa?: number,          // 1-8 (solo tipo mesa)
 *   token?: string,         // token HMAC del QR (solo tipo mesa)
 *   items: [{ id: string, qty: number }],
 *   tipo: "mesa" | "domicilio",
 *   cliente_nombre?: string,
 *   cliente_telefono?: string,
 *   direccion?: string
 * }
 */
export async function POST(req: Request) {
  const n8nUrl = process.env.N8N_WEBHOOK_URL;

  if (!n8nUrl) {
    return NextResponse.json(
      { ok: false, motivo: "Webhook de n8n no configurado" },
      { status: 500 }
    );
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, motivo: "Cuerpo JSON inválido" },
      { status: 400 }
    );
  }

  // Validaciones muy básicas en el borde (defensa en profundidad).
  // La validación crítica (precios, token, horario) vive en n8n.
  const { tipo, items, mesa, token } = body;

  if (!tipo || !["mesa", "domicilio"].includes(tipo)) {
    return NextResponse.json(
      { ok: false, motivo: "tipo inválido" },
      { status: 400 }
    );
  }

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json(
      { ok: false, motivo: "Debe incluir al menos un ítem" },
      { status: 400 }
    );
  }

  for (const it of items) {
    if (!it.id || typeof it.qty !== "number" || it.qty < 1) {
      return NextResponse.json(
        { ok: false, motivo: "Ítem inválido" },
        { status: 400 }
      );
    }
  }

  if (tipo === "mesa") {
    if (!mesa || mesa < 1 || mesa > 8) {
      return NextResponse.json(
        { ok: false, motivo: "Mesa inválida (1-8)" },
        { status: 400 }
      );
    }
    if (!token) {
      return NextResponse.json(
        { ok: false, motivo: "Token de mesa requerido" },
        { status: 400 }
      );
    }
  }

  try {
    const resp = await fetch(n8nUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    let data: any;
    try {
      data = await resp.json();
    } catch {
      data = { ok: false, motivo: "Respuesta inválida de n8n" };
    }

    return NextResponse.json(data, { status: resp.ok ? 200 : resp.status });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, motivo: err.message || "Error contactando n8n" },
      { status: 502 }
    );
  }
}
