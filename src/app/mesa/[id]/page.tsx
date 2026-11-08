"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Producto } from "@/lib/types";
import ProductoCard from "@/components/ProductoCard";
import Carrito from "@/components/Carrito";
import { NUM_MESAS } from "@/lib/constantes";
import { crearPedidoMesa } from "@/lib/n8n";

export default function MesaPage() {
  const params = useParams();
  const router = useRouter();
  const mesaId = Number(params.id);

  // Leer token de la URL: ?token=tok_prueba_mesa3
  const [tokenUrl, setTokenUrl] = useState<string | null>(null);

  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estado del carrito (solo para mostrar precios en pantalla)
  const [items, setItems] = useState<{
    id: string | number;
    nombre: string;
    precio: number;
    qty: number;
  }[]>([]);

  const [pagando, setPagando] = useState(false);
  const [pagoError, setPagoError] = useState<string | null>(null);

  useEffect(() => {
    if (!mesaId || mesaId < 1 || mesaId > NUM_MESAS) {
      router.push("/");
      return;
    }

    // Leer token de los search params
    const searchParams = new URLSearchParams(window.location.search);
    const token = searchParams.get("token");
    setTokenUrl(token ?? null);

    let montado = true;
    const cargar = async () => {
      try {
        const { data: prods, error: eProd } = await supabase
          .from("productos")
          .select("*")
          .order("categoria")
          .order("nombre");
        if (eProd) throw eProd;
        if (montado) setProductos(prods ?? []);
      } catch (err: any) {
        if (montado) setError(err.message || "No se pudo cargar la carta");
      } finally {
        if (montado) setCargando(false);
      }
    };

    cargar();
    return () => {
      montado = false;
    };
  }, [mesaId, router]);

  const agregar = useCallback(
    (id: string | number, nombre: string, precio: number) => {
      setItems((prev) => {
        const existente = prev.find((i) => i.id === id);
        if (existente) {
          return prev.map((i) =>
            i.id === id ? { ...i, qty: i.qty + 1 } : i
          );
        }
        return [...prev, { id, nombre, precio, qty: 1 }];
      });
    },
    []
  );

  const quitarUno = useCallback((id: string | number) => {
    setItems((prev) => {
      const existente = prev.find((i) => i.id === id);
      if (!existente) return prev;
      if (existente.qty <= 1) {
        return prev.filter((i) => i.id !== id);
      }
      return prev.map((i) =>
        i.id === id ? { ...i, qty: i.qty - 1 } : i
      );
    });
  }, []);

  const eliminar = useCallback((id: string | number) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const pagar = async () => {
    if (!tokenUrl) {
      setPagoError("Esta mesa no tiene token válido.");
      return;
    }
    if (items.length === 0) {
      setPagoError("Añade al menos un producto al carrito.");
      return;
    }

    setPagando(true);
    setPagoError(null);

    try {
      const { url } = await crearPedidoMesa({
        mesa: mesaId,
        token: tokenUrl,
        items: items.map((it) => ({ id: it.id, qty: it.qty })),
      });

      // n8n devolvió la URL de Stripe. Redirigir al cliente.
      window.location.href = url;
    } catch (err: any) {
      setPagoError(err.message || "Error al crear el pedido");
    } finally {
      setPagando(false);
    }
  };

  const reset = useCallback(() => {
    setItems([]);
    setPagoError(null);
  }, []);

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-dorado animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-12 px-6 text-center">
        <AlertTriangle className="w-12 h-12 text-amber-600 mb-4" />
        <h1 className="text-2xl font-serif font-bold text-negro mb-2">
          Error cargando la mesa
        </h1>
        <p className="text-negro/60 mb-6">{error}</p>
        <Link href="/" className="btn-blanco">
          Volver al inicio
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-negro/5 bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2 text-xl font-serif font-bold tracking-tight">
              <span className="text-dorado">LM</span> Las Mesas Café Bar
            </Link>
            <div className="hidden md:flex items-center gap-4 text-sm font-medium">
              <span className="pill">
                Mesa <span className="font-bold">{mesaId}</span>
              </span>
              <Link href="/" className="hover:text-dorado transition-colors">
                Cambiar de mesa
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 lg:w-3/5 space-y-8">
            <h2 className="text-3xl font-serif font-bold text-negro mb-4">
              Carta
            </h2>
            {productos.length === 0 ? (
              <p className="text-negro/50">No hay productos disponibles.</p>
            ) : (
              <div className="grid md:grid-cols-3 gap-4">
                {productos.map((p) => (
                  <ProductoCard
                    key={p.id}
                    producto={p}
                    onAgregar={(id) => agregar(id, p.nombre, p.precio)}
                    cantidadActual={items.find((i) => i.id === p.id)?.qty ?? 0}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="lg:w-2/5">
            <Carrito
              items={items.map((it) => ({
                id: it.id,
                nombre: it.nombre,
                precio: it.precio,
                qty: it.qty,
              }))}
              onAgregar={agregar}
              onQuitarUno={quitarUno}
              onEliminar={eliminar}
              cargando={pagando}
              onPagar={pagar}
              tipo="mesa"
              puedePagar={Boolean(tokenUrl) && items.length > 0}
              motivoSinPagar={
                !tokenUrl
                  ? "Esta mesa no tiene token de acceso."
                  : items.length === 0
                  ? "Añade productos al carrito."
                  : undefined
              }
            />
          </div>
        </div>
      </main>

      {pagoError && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-rose-50 border border-rose-100 text-rose-800 px-4 py-3 rounded-lg shadow-lg text-sm">
            <AlertTriangle className="w-4 h-4 mr-2 inline" />
            {pagoError}
          </div>
        </div>
      )}

      <footer className="border-t border-negro/5 bg-white mt-auto py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-negro/60">
          Las Mesas Café Bar · Tel. 928 896 097
        </div>
      </footer>
    </div>
  );
}
