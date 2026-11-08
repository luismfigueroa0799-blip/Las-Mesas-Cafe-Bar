/**
 * src/lib/n8n.ts
 *
 * Funciones para conectar el frontend con los webhooks de n8n
 * a través del proxy de Next.js (/api/pedidos).
 *
 * El proxy vive en el mismo origen, así que no hay problemas de CORS.
 * CRÍTICO: Nunca enviamos precios. Solo { id, qty } por ítem.
 */

export interface N8nRespuesta {
  url: string;
}

export interface N8nError {
  error?: string;
  mensaje?: string;
  detail?: string;
}

/**
 * Envía un pedido de mesa al proxy de Next.js.
 * Body: { tipo: "mesa", mesa, token, items: [{ id, qty }] }
 * El proxy reenvía a n8n/webhook/crear-pedido sin precios.
 */
export async function crearPedidoMesa({
  mesa,
  token,
  items,
}: {
  mesa: number | string;
  token: string;
  items: { id: string | number; qty: number }[];
}): Promise<N8nRespuesta> {
  const body = {
    tipo: "mesa",
    mesa,
    token,
    items: items.map((it) => ({ id: it.id, qty: it.qty })),
  };

  const res = await fetch("/api/pedidos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const mensaje =
      (data as N8nError).error ??
      (data as N8nError).mensaje ??
      `Error ${res.status}`;
    throw new Error(mensaje);
  }

  if (!data.url) {
    throw new Error("n8n no devolvió una URL de pago");
  }

  return data as N8nRespuesta;
}

/**
 * Envía un pedido a domicilio al proxy de Next.js.
 * Body: { tipo: "domicilio", nombre, direccion, cliente_telefono, items: [{ id, qty }] }
 * El proxy reenvía a n8n/webhook/crear-pedido-domicilio sin precios.
 */
export async function crearPedidoDomicilio({
  nombre,
  direccion,
  cliente_telefono,
  items,
}: {
  nombre: string;
  direccion: string;
  cliente_telefono: string;
  items: { id: string | number; qty: number }[];
}): Promise<N8nRespuesta> {
  const body = {
    tipo: "domicilio",
    nombre,
    direccion,
    cliente_telefono,
    items: items.map((it) => ({ id: it.id, qty: it.qty })),
  };

  const res = await fetch("/api/pedidos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const mensaje =
      (data as N8nError).error ??
      (data as N8nError).mensaje ??
      `Error ${res.status}`;
    throw new Error(mensaje);
  }

  if (!data.url) {
    throw new Error("n8n no devolvió una URL de pago");
  }

  return data as N8nRespuesta;
}
