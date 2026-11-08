"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Producto, ItemPedido } from "@/lib/types";
import ProductoCard from "@/components/ProductoCard";
import Carrito from "@/components/Carrito";

export default function DomicilioPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<ItemPedido[]>([]);
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [envioError, setEnvioError] = useState<string | null>(null);
  const [enviado, setEnviado] = useState<{ ok: boolean; id?: string } | null>(
    null
  );

  useEffect(() => {
    const cargar = async () => {
      try {
        const { data: prods, error: e } = await supabase
          .from("productos")
          .select("*")
          .order("categoria")
          .order("nombre");
        if (e) throw e;
        setProductos(prods ?? []);
      } catch (err: any) {
        setError(err.message || "No se pudo cargar la carta");
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  const agregar = useCallback((id: string) => {
    setItems((prev) => {
      const existente = prev.find((i) => i.id === id);
      if (existente) {
        return prev.map((i) => (i.id === id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...prev, { id, qty: 1 }];
    });
  }, []);

  const quitarUno = useCallback((id: string) => {
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

  const eliminar = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const reset = useCallback(() => {
    setItems([]);
    setEnviado(null);
    setEnvioError(null);
    setNombre("");
    setTelefono("");
    setDireccion("");
  }, []);

  const enviar = async () => {
    setEnviando(true);
    setEnvioError(null);
    try {
      const res = await fetch("/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mesa: null,
          items: items.map((i) => ({ id: i.id, qty: i.qty })),
          tipo: "domicilio",
          cliente_nombre: nombre.trim(),
          cliente_telefono: telefono.trim(),
          direccion: direccion.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.motivo || "No se pudo crear el pedido");
      }

      const stripeRes = await fetch("/api/stripe-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pedidoId: data.pedido_id,
          items: data.items,
          totalCents: data.total_cents,
          tipo: "domicilio",
          mesaId: null,
          cliente: { nombre, telefono, direccion },
        }),
      });
      const stripeData = await stripeRes.json();
      if (!stripeRes.ok || !stripeData.url) {
        throw new Error(stripeData.error || "No se pudo iniciar el pago");
      }

      setEnviado({ ok: true, id: data.pedido_id });
      window.location.href = stripeData.url;
    } catch (err: any) {
      setEnvioError(err.message || "Error inesperado");
    } finally {
      setEnviando(false);
    }
  };

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-dorado border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-12 px-6 text-center">
        <MapPin className="w-12 h-12 text-amber-600 mb-4" />
        <h1 className="text-2xl font-serif font-bold text-negro mb-2">
          Error cargando la carta
        </h1>
        <p className="text-negro/60 mb-6">{error}</p>
        <Link href="/" className="btn-blanco">Volver al inicio</Link>
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
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              <Link href="/" className="hover:text-dorado transition-colors">
                Inicio
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 lg:w-3/5 space-y-8">
            <h2 className="text-3xl font-serif font-bold text-negro mb-4">
              Para llevar
            </h2>
            <p className="text-negro/60 mb-6">
              Completa tus datos de entrega en el panel derecho y pide lo que
              quieras.
            </p>
            {productos.length === 0 ? (
              <p className="text-negro/50">No hay productos disponibles.</p>
            ) : (
              <div className="grid md:grid-cols-3 gap-4">
                {productos.map((p) => (
                  <ProductoCard
                    key={p.id}
                    producto={p}
                    onAgregar={agregar}
                    cantidadActual={items.find((i) => i.id === p.id)?.qty ?? 0}
                    esDomicilio
                  />
                ))}
              </div>
            )}
          </div>

          <div className="lg:w-2/5">
            <Carrito
              productos={productos}
              items={items}
              onAgregar={agregar}
              onQuitarUno={quitarUno}
              onEliminar={eliminar}
              onEnviar={enviar}
              tipo="domicilio"
              cargando={enviando}
              error={envioError}
              enviado={enviado}
              onReset={reset}
              nombre={nombre}
              setNombre={setNombre}
              telefono={telefono}
              setTelefono={setTelefono}
              direccion={direccion}
              setDireccion={setDireccion}
            />
          </div>
        </div>
      </main>

      <footer className="border-t border-negro/5 bg-white mt-auto py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-negro/60">
          Las Mesas Café Bar · Tel. 928 896 097 · WhatsApp 601 163 933
        </div>
      </footer>
    </div>
  );
}
