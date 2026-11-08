"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { MapPin, AlertTriangle, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Producto } from "@/lib/types";
import ProductoCard from "@/components/ProductoCard";
import Carrito from "@/components/Carrito";
import { crearPedidoDomicilio } from "@/lib/n8n";

export default function DomicilioPage() {
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

  // Datos de entrega
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");

  const [pagando, setPagando] = useState(false);
  const [pagoError, setPagoError] = useState<string | null>(null);

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

  const agregar = useCallback(
    (id: string | number, nombreProd: string, precio: number) => {
      setItems((prev) => {
        const existente = prev.find((i) => i.id === id);
        if (existente) {
          return prev.map((i) =>
            i.id === id ? { ...i, qty: i.qty + 1 } : i
          );
        }
        return [...prev, { id, nombre: nombreProd, precio, qty: 1 }];
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
    setPagando(true);
    setPagoError(null);

    if (!nombre.trim() || !telefono.trim() || !direccion.trim()) {
      setPagoError("Completa nombre, teléfono y dirección.");
      setPagando(false);
      return;
    }
    if (items.length === 0) {
      setPagoError("Añade al menos un producto al carrito.");
      setPagando(false);
      return;
    }

    try {
      const { url } = await crearPedidoDomicilio({
        nombre: nombre.trim(),
        direccion: direccion.trim(),
        cliente_telefono: telefono.trim(),
        items: items.map((it) => ({ id: it.id, qty: it.qty })),
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
    setNombre("");
    setTelefono("");
    setDireccion("");
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
                    onAgregar={(id) => agregar(id, p.nombre, p.precio)}
                    cantidadActual={items.find((i) => i.id === p.id)?.qty ?? 0}
                    esDomicilio
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
              tipo="domicilio"
              puedePagar={
                items.length > 0 &&
                Boolean(nombre.trim()) &&
                Boolean(telefono.trim()) &&
                Boolean(direccion.trim())
              }
              motivoSinPagar={
                items.length === 0
                  ? "Añade productos al carrito."
                  : !nombre.trim() || !telefono.trim() || !direccion.trim()
                  ? "Completa nombre, teléfono y dirección."
                  : undefined
              }
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
          Las Mesas Café Bar · Tel. 928 896 097 · WhatsApp 601 163 933
        </div>
      </footer>
    </div>
  );
}
