// ============================================================
// Las Mesas Café Bar · tipos compartidos del sistema de pedidos
// ============================================================

export type TipoPedido = "mesa" | "domicilio";

export type EstadoPedido =
  | "pendiente_confirmacion"
  | "pagado"
  | "preparando"
  | "entregado"
  | "cancelado";

/** Línea que envía el frontend a la API: SOLO id y cantidad. Nunca precios. */
export interface ItemPedido {
  id: string;
  qty: number;
}

/** Línea enriquecida que devuelve n8n tras recalcular contra `productos`. */
export interface LineaPedido {
  id: string;
  nombre: string;
  qty: number;
  /** precio unitario en céntimos (Stripe) */
  unit_cents: number;
  /** qty × unit_cents */
  subtotal_cents: number;
}

export interface Producto {
  id: string;
  nombre: string;
  precio: number;
  categoria: string;
  disponible: boolean;
  created_at?: string;
}

/** Cómo se guarda cada línea dentro del jsonb `items` de la tabla pedidos */
export interface ItemPedidoDetalle {
  id: string;
  nombre: string;
  /** precio unitario en euros (2 decimales) */
  unit: number;
  qty: number;
  subtotal: number;
}

export interface PedidosRow {
  id: string;
  mesa_id: number | null;
  tipo: TipoPedido;
  items: ItemPedidoDetalle[];
  total: number;
  estado: EstadoPedido;
  cliente_nombre: string | null;
  cliente_telefono: string | null;
  direccion: string | null;
  stripe_session_id: string | null;
  created_at: string;
}

export interface MesasRow {
  id: number;
  token_actual: string | null;
  token_expira_at: string | null;
  created_at?: string;
}

/** Contrato de respuesta del webhook de n8n (POST /pedidos-nuevo) */
export type RespuestaN8n =
  | {
      ok: true;
      pedido_id: string;
      items: LineaPedido[];
      total_cents: number;
    }
  | {
      ok: false;
      motivo: string;
    };

export const ETIQUETAS_ESTADO: Record<EstadoPedido, string> = {
  pendiente_confirmacion: "Pendiente de confirmación",
  pagado: "Pagado",
  preparando: "Preparando",
  entregado: "Entregado",
  cancelado: "Cancelado",
};
