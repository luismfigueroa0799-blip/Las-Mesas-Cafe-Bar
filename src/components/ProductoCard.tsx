"use client";

import { Plus, Coffee, Utensils, Image as ImageIcon } from "lucide-react";
import { Producto } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ProductoCardProps {
  producto: Producto;
  onAgregar: (id: string) => void;
  cantidadActual?: number;
  esDomicilio?: boolean;
}

export default function ProductoCard({
  producto,
  onAgregar,
  cantidadActual = 0,
  esDomicilio = false,
}: ProductoCardProps) {
  const disponible = producto.disponible;

  return (
    <article className="card-producto group">
      <div className="aspect-[4/3] bg-negro/5 relative overflow-hidden">
        {disponible ? (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-negro/40">
            <Plus className="w-10 h-10 text-white" />
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-negro/60">
            <span className="text-white font-medium text-sm">Agotado</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-serif font-bold text-negro leading-tight">
            {producto.nombre}
          </h3>
          {!disponible && (
            <span className="text-xs text-negro/50 uppercase tracking-wider font-semibold">
              no disponible
            </span>
          )}
        </div>
        <p className="text-xs text-negro/50 mb-3 uppercase tracking-wider">
          {producto.categoria}
        </p>

        <div className="flex items-center justify-between">
          <span className="font-serif font-bold text-xl"> {producto.precio.toFixed(2)} €</span>
          {!disponible ? (
            <span className="text-xs text-negro/40">—</span>
          ) : (
            <button
              onClick={() => onAgregar(producto.id)}
              disabled={!disponible}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-dorado text-negro hover:bg-dorado/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label={`Añadir ${producto.nombre}`}
            >
              <Plus className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
