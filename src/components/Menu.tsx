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

type MenuProps = {
  /** Callback que se llama cuando se agrega un producto al carrito */
  onAgregar?: (producto: Producto) => void;
};

export default function Menu({ onAgregar }: MenuProps) {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const { data, error } = await supabase
          .from("productos")
          .select("*")
          .eq("disponible", true)
          .order("categoria")
          .order("nombre");

        if (error) throw error;

        if (data && data.length > 0) {
          setProductos(data as Producto[]);

          // Extraer categorías únicas y ordenadas
          const categoriasUnicas = [...productos.reduce((acc, p) => {
            if (!acc.includes(p.categoria)) acc.push(p.categoria);
            return acc;
          }, [] as string[])].sort();
          setCategorias(categoriasUnicas);
        }
      } catch (err: any) {
        console.error("Error al cargar productos:", err.message);
      } finally {
        setCargando(false);
      }
    };

    fetchProductos();
  }, []);

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-900 text-white py-12">
        <span className="text-xl text-zinc-400">Cargando carta...</span>
      </div>
    );
  }

  if (productos.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-900 text-white py-12">
        <p className="text-center text-zinc-500 text-lg">No hay productos disponibles en este momento.</p>
      </div>
    );
  }

  // Agrupar productos por categoría
  const productosPorCategoria = productos.reduce((acc, producto) => {
    const cat = producto.categoria;
    if (!acc[cat]) {
      acc[cat] = [];
    }
    acc[cat].push(producto);
    return acc;
  }, {} as Record<string, Producto[]>);

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-10 text-center">
          <h1 className="texto-elegante text-3xl font-bold text-blanco mb-4">
            Nuestra Carta
          </h1>
          <p className="text-texto-secundario text-lg max-w-2xl mx-auto">
            Descubre nuestros platos y bebidas inspirados en el logo de Las Mesas Café Bar
          </p>
        </header>

        {/* Categorías */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {categorias.map((categoria) => {
            const items = productosPorCategoria[categoria] || [];
            return (
              <div
                key={categoria}
                className="border-y border-zinc-800/30 last:border-0"
              >
                <h2
                  className="texto-elegante text-xl font-bold text-zinc-100 py-4 px-2 capitalize"
                >
                  {categoria}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {items.map((producto) => (
                    <div key={producto.id} className="border rounded-lg overflow-hidden bg-zinc-950">
                      <ProductoCard
                        producto={producto}
                        onAgregar={() => onAgregar?.(producto)}
                        esDomicilio={false}
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Productos sin categoría */}
        {Object.values(productosPorCategoria).some((items) => items.length === 0) && (
          <p className="mt-6 text-center text-zinc-500 text-sm">
            *Productos sin categoría asignada
          </p>
        )}
      </div>
    </div>
  );
}