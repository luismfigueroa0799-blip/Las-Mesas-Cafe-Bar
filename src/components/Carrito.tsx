"use client";

import { useCallback } from "react";
import {
  Trash2,
  Minus,
  AlertTriangle,
  CheckCircle,
  CreditCard,
} from "lucide-react";
import { Producto } from "@/lib/types";
import { ItemPedido } from "@/lib/types";
import { formatoMoneda, cn } from "@/lib/utils";

interface CarritoProps {
  productos: Producto[];
  items: ItemPedido[];
  onAgregar: (id: string) => void;
  onQuitarUno: (id: string) => void;
  onEliminar: (id: string) => void;
  onEnviar: () => Promise<void> | void;
  tipo: "mesa" | "domicilio";
  mesaId?: number;
  cargando: boolean;
  error: string | null;
  enviado: { ok: boolean; id?: string } | null;
  onReset: () => void;
  nombre: string;
  setNombre: (v: string) => void;
  telefono: string;
  setTelefono: (v: string) => void;
  direccion: string;
  setDireccion: (v: string) => void;
}

const PRODUCTO_MAP = new Map<string, Producto>();

export default function Carrito({
  productos,
  items,
  onAgregar,
  onQuitarUno,
  onEliminar,
  onEnviar,
  tipo,
  mesaId,
  cargando,
  error,
  enviado,
  onReset,
  nombre,
  setNombre,
  telefono,
  setTelefono,
  direccion,
  setDireccion,
}: CarritoProps) {
  productos.forEach((p) => PRODUCTO_MAP.set(p.id, p));

  const totalCents = items.reduce(
    (acc, it) => {
      const p = PRODUCTO_MAP.get(it.id);
      return acc + (p ? Math.round(p.precio * 100) * it.qty : 0);
    },
    0
  );

  const qtyDe = (id: string) => items.find((i) => i.id === id)?.qty ?? 0;

  if (enviado?.ok) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4 text-green-600">
          <CheckCircle className="w-10 h-10" />
        </div>
        <h3 className="text-xl font-serif font-bold text-negro">Pedido enviado</h3>
        <p className="text-negro/60 mt-2">
          Tu pedido #{enviado.id} se ha creado y está pendiente de confirmación
          por el personal. Serás redirigido al pago.
        </p>
        <button onClick={onReset} className="btn-blanco mt-6">
          Hacer otro pedido
        </button>
      </div>
    );
  }

  return (
    <aside className="fixed inset-y-0 right-0 w-full max-w-md bg-white border-l border-negro/5 shadow-2xl z-50 flex flex-col sm:translate-x-0">
      <div className="p-6 border-b border-negro/5">
        <h2 className="font-serif font-bold text-xl text-negro">Tu pedido</h2>
        <p className="text-xs text-negro/50 mt-1">
          {tipo === "mesa" ? `Mesa ${mesaId}` : "Para llevar / Domicilio"}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {error && (
          <div className="rounded-lg bg-amber-50 p-3 border border-amber-100">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
              <span className="text-sm text-amber-800">{error}</span>
            </div>
          </div>
        )}

        {items.length === 0 ? (
          <div className="text-center py-10 text-negro/40">
            <span className="text-xs uppercase tracking-wider font-medium">
              Carrito vacío
            </span>
          </div>
        ) : (
          <>
            {items.map((it) => {
              const p = PRODUCTO_MAP.get(it.id);
              if (!p) return null;
              const subtotal = Math.round(p.precio * 100) * it.qty / 100;
              return (
                <div
                  key={it.id}
                  className="flex items-center gap-3 py-2 border-b border-negro/5 last:border-0"
                >
                  <div className="flex-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-negro">
                        {p.nombre} ×{it.qty}
                      </span>
                      <span className="font-serif font-bold text-negro">
                        {subtotal.toFixed(2)} €
                      </span>
                    </div>
                    <p className="text-xs text-negro/40">{p.categoria}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onQuitarUno(it.id)}
                      className="w-8 h-8 rounded-full border border-negro/20 flex items-center justify-center hover:bg-negro/5 transition-colors"
                      aria-label="Quitar uno"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEliminar(it.id)}
                      className="text-xs text-negro/40 hover:text-negro underline"
                      aria-label="Eliminar"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              );
            })}

            <div className="mt-6 pt-4 border-t border-negro/10">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-negro/60">Subtotal</span>
                <span className="font-serif font-bold text-negro">
                  {formatoMoneda(totalCents)}
                </span>
              </div>
              <div className="flex justify-between font-serif font-bold text-xl text-negro border-t border-negro/5 pt-2">
                <span>Total</span>
                <span>{formatoMoneda(totalCents)}</span>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="p-6 border-t border-negro/5">
        {tipo === "domicilio" && (
          <div className="space-y-3 mb-4">
            <label className="text-xs font-semibold text-negro/70 uppercase tracking-wider">
              Datos de entrega
            </label>
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Nombre y apellidos"
              className="w-full px-3 py-2 rounded-lg border border-negro/10 bg-white focus:ring-2 focus:ring-dorado outline-none"
            />
            <input
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="Teléfono"
              className="w-full px-3 py-2 rounded-lg border border-negro/10 bg-white focus:ring-2 focus:ring-dorado outline-none"
            />
            <input
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              placeholder="Dirección completa"
              className="w-full px-3 py-2 rounded-lg border border-negro/10 bg-white focus:ring-2 focus:ring-dorado outline-none"
            />
          </div>
        )}

        {items.length > 0 && (
          <button
            onClick={onEnviar}
            disabled={cargando || items.length === 0}
            className={cn(
              "w-full py-4 rounded-xl font-semibold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed",
              cargando || items.length === 0
                ? "bg-negro/20 text-negro/40 border border-negro/10"
                : "bg-dorado text-negro hover:bg-dorado/90 border border-dorado/20"
            )}
          >
            {cargando ? "Enviando pedido..." : "Enviar y pagar"}
          </button>
        )}
        <p className="text-xs text-negro/40 text-center mt-3">
          El pago se realiza con tarjeta tras la validación del pedido.
        </p>
      </div>
    </aside>
  );
}
