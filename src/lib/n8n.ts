/**
 * src/lib/n8n.ts
 *
 * Funciones para conectar el frontend con los webhooks de n8n.
 * CRÍTICO: Nunca enviamos precios. Solo { id, qty } por ítem.
 */

const N8N_BASE = "https://barcafeteria.app.n8n.cloud/webhook";

export interface CarritoItem {
  id: string | number;
  nombre: string;
  precio: number; // solo para mostrar en pantalla
  qty: number;
}

/** Respuesta esperada de n8n: { url: string } */
export interface N8nRespuesta {
  url: string;
}

/** Error estructurado devuelto por n8n */
export interface N8nError {
  error?: string;
  mensaje?: string;
  detail?: string;
}

/**
 * Envía un pedido de mesa a n8n.
 * Body: { mesa, token, items: [{ id, qty }] }
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
    mesa,
    token,
    items: items.map((it) => ({ id: it.id, qty: it.qty })),
  };

  const res = await fetch(`${N8N_BASE}/crear-pedido`, {
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
 * Envía un pedido a domicilio a n8n.
 * Body: { nombre, direccion, cliente_telefono, items: [{ id, qty }] }
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
    nombre,
    direccion,
    cliente_telefono,
    items: items.map((it) => ({ id: it.id, qty: it.qty })),
  };

  const res = await fetch(`${N8N_BASE}/crear-pedido-domicilio`, {
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
