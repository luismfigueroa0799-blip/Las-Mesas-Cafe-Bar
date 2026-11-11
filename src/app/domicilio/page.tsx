"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { MapPin, AlertTriangle, Loader2, Coffee, CheckCircle, Phone } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Producto } from "@/lib/types";
import ProductoCard from "@/components/ProductoCard";
import Carrito from "@/components/Carrito";
import { crearPedidoDomicilio } from "@/lib/n8n";
import Header from "@/components/Header";

export default function DomicilioPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [items, setItems] = useState<{
    id: string | number;
    nombre: string;
    precio: number;
    qty: number;
  }[]>([]);

  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");

  const [pagando, setPagando] = useState(false);
  const [pagoError, setPagoError] = useState<string | null>(null);
  const [pagoExitoso, setPagoExitoso] = useState<string | null>(null);

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
    if (!nombre.trim() || !telefono.trim() || !direccion.trim()) {
      setPagoError("Completa nombre, telefono y direccion.");
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
      const { url } = await crearPedidoDomicilio({
        nombre: nombre.trim(),
        direccion: direccion.trim(),
        cliente_telefono: telefono.trim(),
        items: items.map((it) => ({ id: Number(it.id), qty: it.qty })),
      });

      setPagoExitoso("redirect");
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
    setNombre("");
    setTelefono("");
    setDireccion("");
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
        <MapPin className="w-12 h-12 text-amber-500 mb-4" />
        <h1 className="texto-elegante text-2xl font-bold text-blanco mb-2">
          Error cargando la carta
        </h1>
        <p className="text-texto-secundario mb-6">{error}</p>
        <Link href="/" className="btn-dorado text-negro px-8 py-3">
          Volver al inicio
        </Link>
      </div>
    );
  }

  const puedePagar =
    items.length > 0 &&
    Boolean(nombre.trim()) &&
    Boolean(telefono.trim()) &&
    Boolean(direccion.trim());

  const motivoSinPagar =
    items.length === 0
      ? "Aneade productos al carrito."
      : !nombre.trim() || !telefono.trim() || !direccion.trim()
        ? "Completa nombre, telefono y direccion."
        : undefined;

  return (
    <div className="min-h-screen flex flex-col bg-negro">
      <Header />

      <main className="flex-1 pt-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-10 mb-10">
            <div className="flex-1 lg:w-3/5 space-y-10">
              <div>
                <h1 className="texto-elegante text-3xl font-bold text-blanco">
                  Para llevar
                </h1>
                <p className="text-texto-secundario mt-2">
                  Completa tus datos de entrega y pide lo que quieras desde casa.
                </p>
              </div>
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
                      esDomicilio
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
                onVaciar={() => {
                  setItems([]);
                  setNombre("");
                  setTelefono("");
                  setDireccion("");
                }}
                cargando={pagando}
                onPagar={pagar}
                tipo="domicilio"
                puedePagar={puedePagar}
                motivoSinPagar={motivoSinPagar}
                nombre={nombre}
                setNombre={setNombre}
                telefono={telefono}
                setTelefono={setTelefono}
                direccion={direccion}
                setDireccion={setDireccion}
              />
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-borde/30 bg-negro/50 mt-auto py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-texto-secundario/50">
          Las Mesas Cafe Bar · Tel. 928 896 097 · WhatsApp 601 163 933
        </div>
      </footer>
    </div>
  );
}
