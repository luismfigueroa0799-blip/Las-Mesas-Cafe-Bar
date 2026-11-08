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

      const body = { mesa: null, token: null, items: items.map((i) => ({ id: i.id, qty: i.qty })) };

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
    <div className="min-h-screen bg-zinc-900 text-white">
      <Head>
        <title>Menú - Las Mesas Café Bar</title>
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="border-b border-zinc-800/30 mb-10 py-6">
          <div className="max-w-2xl mx-auto">
            <h1 className="texto-elegante text-2xl font-bold text-blanco">
              Menú Las Mesas Café Bar
            </h1>
            <p className="text-texto-secundario mt-1">
              Pide desde nuestra carta y disfruta en mesa o en domicilio
            </p>
          </div>
        </header>

        <main className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Menu onAgregar={agregarProducto} />

          <div className="lg:col-span-1 bg-zinc-950 rounded-lg p-6 border border-zinc-800/30">
            <h2 className="texto-elegante text-xl font-bold text-blanco mb-4">Tu Pedido</h2>

            {items.length === 0 ? (
              <p className="text-zinc-400 text-sm mb-4">
                El carrito está vacío. Anexa productos desde el menú.
              </p>
            ) : (
              <ul className="space-y-2 mb-4">
                {items.map((item) => (
                  <li key={item.id} className="flex justify-between text-sm">
                    <span>{item.qty}x {item.nombre}</span>
                    <span className="text-yellow-500">{(item.precio * item.qty).toFixed(2)} €</span>
                  </li>
                ))}
              </ul>
            )}

            <div className="border-t border-zinc-700 pt-4 mt-4 flex justify-between font-bold text-lg">
              <span>Total:</span>
              <span className="text-yellow-500">{total.toFixed(2)} €</span>
            </div>

            <button
              onClick={pagar}
              disabled={items.length === 0 || cargando}
              className="w-full mt-4 bg-yellow-600 hover:bg-yellow-500 text-black font-bold py-2 px-4 rounded transition-colors disabled:opacity-50"
            >
              {cargando ? "Procesando..." : "Pagar"}
            </button>
          </div>
        </main>

        <footer className="border-t border-zinc-700/30 mt-10 py-6 text-xs text-zinc-500/50 text-center">
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