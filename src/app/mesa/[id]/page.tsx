"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, Loader2, Coffee, CheckCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Producto } from "@/lib/types";
import ProductoCard from "@/components/ProductoCard";
import Carrito from "@/components/Carrito";
import { NUM_MESAS } from "@/lib/constantes";
import { crearPedidoMesa } from "@/lib/n8n";
import Header from "@/components/Header";

export default function MesaPage() {
  const params = useParams();
  const router = useRouter();
  const mesaId = Number(params.id);

  const [tokenUrl, setTokenUrl] = useState<string | null>(null);

  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [items, setItems] = useState<{
    id: string | number;
    nombre: string;
    precio: number;
    qty: number;
  }[]>([]);

  const [pagando, setPagando] = useState(false);
  const [pagoError, setPagoError] = useState<string | null>(null);
  const [pagoExitoso, setPagoExitoso] = useState<string | null>(null);

  useEffect(() => {
    if (!mesaId || mesaId < 1 || mesaId > NUM_MESAS) {
      router.push("/");
      return;
    }

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
      setPagoError("Esta mesa no tiene token valido.");
      return;
    }
    if (items.length === 0) {
      setPagoError("Anade al menos un producto al carrito.");
      return;
    }

    setPagando(true);
    setPagoError(null);
    setPagoExitoso(null);

    try {
      const { url } = await crearPedidoMesa({
        mesa: mesaId,
        token: tokenUrl,
        items: items.map((it) => ({ id: Number(it.id), qty: it.qty })),
      });

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
    setPagoExitoso(null);
  }, []);

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-negro">
        <Loader2 className="w-10 h-10 text-dorado animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-20 px-6 text-center bg-negro">
        <AlertTriangle className="w-12 h-12 text-amber-500 mb-4" />
        <h1 className="texto-elegante text-2xl font-bold text-blanco mb-2">
          Error cargando la mesa
        </h1>
        <p className="text-texto-secundario mb-6">{error}</p>
        <Link href="/" className="btn-dorado text-negro px-8 py-3">
          Volver al inicio
        </Link>
      </div>
    );
  }

  const puedePagar = Boolean(tokenUrl) && items.length > 0;
  const motivoSinPagar =
    !tokenUrl
      ? "Esta mesa no tiene token de acceso."
      : items.length === 0
        ? "Aneade productos al carrito."
        : undefined;

  return (
    <div className="min-h-screen flex flex-col bg-negro">
      <Header />

      <main className="flex-1 pt-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
            <div>
              <h1 className="texto-elegante text-3xl font-bold text-blanco">
                Mesa <span className="text-dorado">{mesaId}</span>
              </h1>
              <p className="text-texto-secundario">
                Carta · Selecciona lo que desees consumir
              </p>
            </div>
            <div className="flex items-center gap-3">
              {tokenUrl ? (
                <span className="px-3 py-1 rounded-full bg-dorado/10 border border-dorado/20 text-dorado-claro text-xs font-bold">
                  Token activo
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-borde border border-borde text-texto-secundario text-xs font-bold">
                  Sin token
                </span>
              )}
            </div>
          </div>

          {pagoExitoso && (
            <div className="mb-8 p-6 rounded-3xl bg-dorado/10 border border-dorado/20 flex items-start gap-4 text-dorado-claro animate-fade-in">
              <CheckCircle className="w-6 h-6 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-blanco mb-1">Pedido enviado</h3>
                <p className="text-sm">
                  Tu pedido ha sido creado correctamente. Seras redirigido a Stripe para completar el pago.
                </p>
              </div>
            </div>
          )}

          {pagoError && (
            <div className="mb-8 p-6 rounded-3xl bg-rose-900/20 border border-rose-500/30 flex items-start gap-4 text-rose-400 animate-fade-in">
              <AlertTriangle className="w-6 h-6 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-rose-200 mb-1">Error</h3>
                <p className="text-sm">{pagoError}</p>
                <button
                  onClick={reset}
                  className="mt-3 text-xs underline hover:text-rose-300"
                >
                  Intentar de nuevo
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-10">
            <div className="flex-1 lg:w-3/5 space-y-10">
              <h2 className="texto-elegante text-2xl font-bold text-blanco mb-6">
                Carta
              </h2>
              {productos.length === 0 ? (
                <div className="text-center py-20">
                  <Coffee className="w-16 h-16 text-dorado/20 mx-auto mb-4" />
                  <p className="text-texto-secundario">No hay productos disponibles.</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-3 gap-6">
                  {productos.map((p) => (
                    <ProductoCard
                      key={p.id}
                      producto={p}
                      onAgregar={agregar}
                      cantidadActual={items.find((i) => i.id === p.id)?.qty ?? 0}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="lg:w-2/5">
              <Carrito
                items={items.map((it) => ({
                  id: Number(it.id),
                  nombre: it.nombre,
                  precio: it.precio,
                  qty: it.qty,
                }))}
                onAgregar={agregar}
                onQuitarUno={quitarUno}
                onEliminar={eliminar}
                onVaciar={() => setItems([])}
                cargando={pagando}
                onPagar={pagar}
                tipo="mesa"
                puedePagar={puedePagar}
                motivoSinPagar={motivoSinPagar}
              />
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-borde/30 bg-negro/50 mt-auto py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-texto-secundario/50">
          Las Mesas Cafe Bar · Tel. 928 896 097
        </div>
      </footer>
    </div>
  );
}
