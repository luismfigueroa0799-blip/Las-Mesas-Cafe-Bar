import { NextResponse } from "next/server";

/**
 * POST /api/pedidos
 *
 * Proxy del frontend hacia los webhooks de n8n.
 * Vive en el mismo origen, así que el navegador puede llamarlo sin problemas de CORS.
 *
 * Body esperado del frontend:
 * {
 *   tipo: "mesa" | "domicilio",
 *   mesa?: number,          // 1-8 (solo mesa)
 *   token?: string,         // token HMAC del QR (solo mesa)
 *   items: [{ id: string, qty: number }],
 *   cliente_nombre?: string,   // (solo domicilio)
 *   cliente_telefono?: string, // (solo domicilio)
 *   direccion?: string         // (solo domicilio)
 * }
 *
 * El proxy construye el payload limpio para n8n (SIN precios, SIN tipo)
 * y lo reenvía al webhook correspondiente. La validación crítica de precios,
 * token y horario vive en n8n.
 */
export async function POST(req: Request) {
  const n8nBase = process.env.N8N_WEBHOOK_URL;

  if (!n8nBase) {
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

  const {
    tipo,
    items,
    mesa,
    token,
    cliente_nombre,
    cliente_telefono,
    direccion,
  } = body;

  // Validaciones básicas en el borde (defensa en profundidad).
  // La validación crítica (precios, token, horario) vive en n8n.
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

  const itemsLimpios = items.map((it) => ({ id: it.id, qty: it.qty }));

  let payload: any;
  let webhookUrl: string;

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

    // Payload exacto que n8n espera para mesas (sin precios)
    payload = { mesa, token, items: itemsLimpios };

    // Webhook específico para mesas
    webhookUrl =
      process.env.N8N_WEBHOOK_MESA_URL ??
      `${n8nBase.replace(/\/+$/, "")}/crear-pedido`;
  } else {
    // domicilio
    if (!cliente_nombre || !cliente_telefono || !direccion) {
      return NextResponse.json(
        { ok: false, motivo: "nombre, teléfono y dirección requeridos" },
        { status: 400 }
      );
    }

    // Payload exacto que n8n espera para domicilio (sin precios)
    payload = {
      nombre: cliente_nombre,
      direccion,
      cliente_telefono,
      items: itemsLimpios,
    };

    // Webhook específico para domicilio
    webhookUrl =
      process.env.N8N_WEBHOOK_DOMICILIO_URL ??
      `${n8nBase.replace(/\/+$/, "")}/crear-pedido-domicilio`;
  }

  try {
    const resp = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
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
