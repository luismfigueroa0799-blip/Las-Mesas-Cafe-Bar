"use client";

import { useState, useEffect } from "react";
import ProductoCard from "./ProductoCard";
import { supabase } from "@/lib/supabase";

type Producto = {
  id: number;
  nombre: string;
  precio: number;
  categoria: string;
  disponible: boolean;
};

export default function Carta() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const { data, error } = await supabase
          .from("productos")
          .select("*")
          .eq("disponible", true);

        if (error) throw error;

        if (data && data.length > 0) {
          setProductos(data as Producto[]);
        }
      } catch (err: any) {
        console.error("Error al cargar carta:", err.message);
      } finally {
        setCargando(false);
      }
    };

    fetchProductos();
  }, []);

  // Agrupar productos por categoría
  const productosPorCategoria = productos.reduce((acc, producto) => {
    const cat = producto.categoria;
    if (!acc[cat]) {
      acc[cat] = [];
    }
    acc[cat].push(producto);
    return acc;
  }, {} as Record<string, Producto[]>);

  // Orden fijo de categorías
  const ordenCategorias = [
    "Entrantes",
    "Hamburguesas",
    "Pizzas",
    "Bocadillos",
    "Cafés",
    "Refrescos",
    "Cervezas"
  ];

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-10 border-b border-zinc-800/30 pb-6">
          <div className="flex justify-between items-center">
            <h1 className="texto-elegante text-3xl font-bold text-blanco">
              Nuestra Carta
            </h1>
            <p className="text-texto-secundario text-sm text-zinc-400">
              Las Mesas Café Bar
            </p>
          </div>
        </header>

        {/* Grid de categorías */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {ordenCategorias.map((categoria) => {
            const items = productosPorCategoria[categoria] || [];
            return (
              <div key={categoria} className="border rounded-lg overflow-hidden bg-zinc-950">
                <div className="px-4 py-3 border-b border-zinc-800/30">
                  <h2 className="texto-elegante font-bold text-zinc-100 capitalize">
                    {categoria}
                  </h2>
                </div>
                <div className="p-4 grid grid-cols-2 gap-4">
                  {items.map((producto) => (
                    <div key={producto.id} className="border rounded-lg p-3 bg-zinc-900">
                      <div className="text-white mb-2 text-sm">{producto.nombre}</div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400 text-xs">€</span>
                        <span className="text-[var(--dorado)] font-bold text-lg">{producto.precio}</span>
                      </div>
                      <ProductoCard
                        producto={producto}
                        onAgregar={() => {}}
                        esDomicilio={false}
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}