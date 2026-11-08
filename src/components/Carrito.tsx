"use client";

import { useCallback } from "react";
import {
  Trash2,
  Minus,
  Plus,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface CarritoItem {
  id: string | number;
  nombre: string;
  precio: number; // solo para mostrar en pantalla
  qty: number;
}

interface CarritoProps {
  items: CarritoItem[];
  onAgregar: (id: string | number, nombre: string, precio: number) => void;
  onQuitarUno: (id: string | number) => void;
  onEliminar: (id: string | number) => void;
  cargando: boolean;
  onPagar: () => void | Promise<void>;
  tipo: "mesa" | "domicilio";
  puedePagar: boolean;
  motivoSinPagar?: string;
  nombre?: string;
  setNombre?: (v: string) => void;
  telefono?: string;
  setTelefono?: (v: string) => void;
  direccion?: string;
  setDireccion?: (v: string) => void;
}

export default function Carrito({
  items,
  onAgregar,
  onQuitarUno,
  onEliminar,
  cargando,
  onPagar,
  tipo,
  puedePagar,
  motivoSinPagar,
  nombre,
  setNombre,
  telefono,
  setTelefono,
  direccion,
  setDireccion,
}: CarritoProps) {
  const total = items.reduce((acc, it) => acc + it.precio * it.qty, 0);

  const qtyDe = (id: string | number) =>
    items.find((i) => i.id === id)?.qty ?? 0;

  return (
    <aside className="fixed inset-y-0 right-0 w-full max-w-md bg-white border-l border-negro/5 shadow-2xl z-50 flex flex-col">
      <div className="p-6 border-b border-negro/5">
        <h2 className="font-serif font-bold text-xl text-negro">Tu pedido</h2>
        <p className="text-xs text-negro/50 mt-1 uppercase tracking-wider">
          {tipo === "mesa" ? "Mesa" : "Para llevar / Domicilio"}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {items.length === 0 ? (
          <div className="text-center py-10 text-negro/40">
            <span className="text-xs uppercase tracking-wider font-medium">
              Carrito vacío
            </span>
          </div>
        ) : (
          <>
            {items.map((it) => (
              <div
                key={`${it.id}-${it.qty}`}
                className="flex items-center gap-3 py-2 border-b border-negro/5 last:border-0"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-negro truncate">
                      {it.nombre} ×{it.qty}
                    </span>
                    <span className="font-serif font-bold text-negro">
                      {(it.precio * it.qty).toFixed(2)} €
                    </span>
                  </div>
                  <p className="text-xs text-negro/40">Precio unitario: {it.precio.toFixed(2)} €</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onQuitarUno(it.id)}
                    disabled={cargando}
                    className="w-8 h-8 rounded-full border border-negro/20 flex items-center justify-center hover:bg-negro/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Quitar uno"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onEliminar(it.id)}
                    disabled={cargando}
                    className="text-xs text-negro/40 hover:text-negro underline disabled:opacity-50"
                    aria-label="Eliminar"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}

            <div className="mt-6 pt-4 border-t border-negro/10">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-negro/60">Subtotal</span>
                <span className="font-serif font-bold text-negro">
                  {total.toFixed(2)} €
                </span>
              </div>
              <div className="flex justify-between font-serif font-bold text-xl text-negro border-t border-negro/5 pt-2">
                <span>Total</span>
                <span>{total.toFixed(2)} €</span>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="p-6 border-t border-negro/5">
        {tipo === "domicilio" && (
          <div className="space-y-3 mb-4">
            <label className="text-xs font-semibold text-negro/70 uppercase tracking-wider block mb-1">
              Datos de entrega
            </label>
            <input
              value={nombre ?? ""}
              onChange={(e) => setNombre?.(e.target.value)}
              placeholder="Nombre y apellidos"
              disabled={cargando}
              className="w-full px-3 py-2 rounded-lg border border-negro/10 bg-white focus:ring-2 focus:ring-dorado outline-none disabled:bg-negro/5"
            />
            <input
              value={telefono ?? ""}
              onChange={(e) => setTelefono?.(e.target.value)}
              placeholder="Teléfono"
              disabled={cargando}
              className="w-full px-3 py-2 rounded-lg border border-negro/10 bg-white focus:ring-2 focus:ring-dorado outline-none disabled:bg-negro/5"
            />
            <input
              value={direccion ?? ""}
              onChange={(e) => setDireccion?.(e.target.value)}
              placeholder="Dirección completa"
              disabled={cargando}
              className="w-full px-3 py-2 rounded-lg border border-negro/10 bg-white focus:ring-2 focus:ring-dorado outline-none disabled:bg-negro/5"
            />
          </div>
        )}

        {!puedePagar && motivoSinPagar && (
          <div className="rounded-lg bg-amber-50 p-3 border border-amber-100 mb-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
              <span className="text-sm text-amber-800">{motivoSinPagar}</span>
            </div>
          </div>
        )}

        {items.length > 0 && puedePagar ? (
          <button
            onClick={onPagar}
            disabled={cargando}
            className={cn(
              "w-full py-4 rounded-xl font-semibold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed",
              cargando
                ? "bg-negro/20 text-negro/40 border border-negro/10"
                : "bg-dorado text-negro hover:bg-dorado/90 border border-dorado/20"
            )}
          >
            {cargando ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Procesando pago...
              </>
            ) : (
              "Pagar con tarjeta"
            )}
          </button>
        ) : (
          <button
            disabled
            className="w-full py-4 rounded-xl font-semibold text-lg bg-negro/20 text-negro/40 border border-negro/10 cursor-not-allowed"
          >
            {tipo === "mesa" ? "Pagar con tarjeta" : "Pagar con tarjeta"}
          </button>
        )}
        <p className="text-xs text-negro/40 text-center mt-3">
          Los precios se validan en el servidor antes de cobrar.
        </p>
      </div>
    </aside>
  );
}
