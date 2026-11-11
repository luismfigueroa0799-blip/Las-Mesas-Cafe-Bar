"use client";

import { useState } from "react";
import Menu from "@/components/Menu";
import Carrito from "@/components/Carrito";
import Link from "next/link";
import Head from "next/head";

export default function MenuPage() {
  const [items, setItems] = useState<ItemCarrito[]>([]);
  const [cargando, setCargando] = useState(false);
  const total = items.reduce((acc, item) => acc + item.precio * item.qty, 0);

  const agregarProducto = (producto: Omit<ItemCarrito, "qty">) => {
    setItems((prev) => {
      const existe = prev.find((i) => i.id === producto.id);
      if (existe) {
        return prev.map((i) =>
          i.id === producto.id ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [...prev, { ...producto, qty: 1 }];
    });
  };

  const pagar = async () => {
    if (items.length === 0) return;
    setCargando(true);

    try {
      const url = "https://barcafeteria.app.n8n.cloud/webhook/crear-pedido";

      const body = {
        mesa: null,
        token: null,
        items: items.map((i) => ({ id: i.id, qty: i.qty })),
      };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Error al procesar el pago.");
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-negro text-blanco">
      <Head>
        <title>Menú - Las Mesas Café Bar</title>
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="border-b border-borde/30 mb-10 py-6">
          <div className="max-w-2xl mx-auto">
            <h1 className="texto-elegante text-2xl font-bold text-blanco">
              Menú Las Mesas Café Bar
            </h1>
            <p className="text-texto-secundario mt-1">
              Pide desde nuestra carta y disfruta en mesa o en domicilio
            </p>
            <div className="mt-4 flex gap-3">
              <Link href="/mesa" className="btn-dorado">
                Pedir en mesa
              </Link>
              <Link href="/domicilio" className="btn-outline-dorado">
                Pedir a domicilio
              </Link>
            </div>
          </div>
        </header>

        <main className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Menu onAgregar={agregarProducto} />

          <div className="lg:col-span-1">
            <Carrito
              items={items.map((it) => ({
                id: Number(it.id),
                nombre: it.nombre,
                precio: it.precio,
                qty: it.qty,
              }))}
              onAgregar={(id, nombre, precio) =>
                agregarProducto({ id, nombre, precio })
              }
              onEliminar={(id) =>
                setItems((prev) => prev.filter((i) => i.id !== id))
              }
              onVaciar={() => setItems([])}
              total={total}
              cargando={cargando}
              onPagar={pagar}
              tipo="mesa"
            />
          </div>
        </main>

        <footer className="border-t border-borde/30 mt-10 py-6 text-xs text-texto-secundario/50 text-center">
          Las Mesas Café Bar · Tel. 928 896 097 · WhatsApp 601 163 933
        </footer>
      </div>
    </div>
  );
}

type ItemCarrito = {
  id: number;
  nombre: string;
  precio: number;
  qty: number;
};
