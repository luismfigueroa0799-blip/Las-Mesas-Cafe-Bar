"use client";

import { Plus, Coffee } from "lucide-react";

export interface ProductoCardProps {
  producto: {
    id: string | number;
    nombre: string;
    precio: number;
    categoria?: string;
    disponible?: boolean;
    imagen?: string;
  };
  onAgregar: (id: string | number, nombre: string, precio: number) => void;
  cantidadActual?: number;
  esDomicilio?: boolean;
}

export default function ProductoCard({
  producto,
  onAgregar,
  cantidadActual = 0,
  esDomicilio = false,
}: ProductoCardProps) {
  const esDisponible = producto.disponible !== false;

  return (
    <article className="card-producto group">
      <div className="h-48 bg-negro-suave relative overflow-hidden">
        {producto.imagen ? (
          <img
            src={producto.imagen}
            alt={producto.nombre}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-borde/50">
            <Coffee className="w-12 h-12 text-dorado/30" />
          </div>
        )}
        {!esDisponible && (
          <div className="absolute inset-0 bg-negro/80 flex items-center justify-center">
            <span className="text-xs font-bold text-texto-secundario uppercase tracking-wider">
              No disponible
            </span>
          </div>
        )}
        <span className="absolute top-3 left-3 pill-dorado">
          {producto.categoria ? producto.categoria.charAt(0).toUpperCase() + producto.categoria.slice(1) : ""}
        </span>
      </div>

      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="texto-elegante text-lg font-bold text-blanco truncate">
            {producto.nombre}
          </h3>
          <span className="texto-elegante font-bold text-dorado text-lg">
            {producto.precio.toFixed(2)} EUR
          </span>
        </div>
        <p className="text-xs text-texto-secundario mb-4 line-clamp-2">
          {esDomicilio ? "Disponible para llevar" : "Disponible en mesa"}
        </p>

        {!esDisponible ? (
          <button
            disabled
            className="w-full py-3 rounded-xl bg-borde text-texto-secundario text-xs font-bold uppercase tracking-wider cursor-not-allowed"
          >
            No disponible
          </button>
        ) : (
          <button
            onClick={() => onAgregar(producto.id, producto.nombre, producto.precio)}
            disabled={cantidadActual > 0 && cantidadActual >= 10}
            className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 ${
              cantidadActual > 0
                ? "bg-dorado text-negro shadow-dorado hover:bg-dorado-claro hover:shadow-dorado-hover"
                : "bg-borde border border-dorado/30 text-dorado hover:bg-dorado hover:text-negro"
            }`}
          >
            {cantidadActual > 0 ? `+ Anadir otra (${cantidadActual})` : "+ Anadir"}
          </button>
        )}
      </div>
    </article>
  );
}
