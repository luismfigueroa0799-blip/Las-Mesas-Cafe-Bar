"use client";

import { useState } from "react";

type ItemCarrito = {
  id: number;
  nombre: string;
  precio: number;
  qty: number;
};

type CarritoProps = {
  mesa?: number;
  token?: string;
  items?: ItemCarrito[];
  total?: number;
  cargando?: boolean;
  onPagar?: () => void;
  onAgregar?: (id: number, nombreProd: string, precio: number) => void;
  onQuitarUno?: (id: number) => void;
  onEliminar?: (id: number) => void;
  tipo?: "mesa" | "domicilio";
  puedePagar?: boolean;
  motivoSinPagar?: string;
  nombre?: string;
  setNombre?: React.Dispatch<React.SetStateAction<string>>;
  telefono?: string;
  setTelefono?: React.Dispatch<React.SetStateAction<string>>;
  direccion?: string;
  setDireccion?: React.Dispatch<React.SetStateAction<string>>;
};

export default function Carrito({ mesa, token, items: propItems, total: propTotal, cargando }: CarritoProps) {
  // Usar items del prop si están disponibles, sino usar estado interno
  const [internalItems, setInternalItems] = useState<ItemCarrito[]>([]);
  const cartItems = propItems || internalItems;
  const total = propTotal !== undefined ? propTotal : cartItems.reduce((acc, item) => acc + item.precio * item.qty, 0);

  const agregarProducto = (producto: Omit<ItemCarrito, "qty">) => {
    setInternalItems((prev) => {
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
    if (cartItems.length === 0) return;

    try {
      const esDomicilio = !mesa;
      const url = esDomicilio
        ? "https://barcafeteria.app.n8n.cloud/webhook/crear-pedido-domicilio"
        : "https://barcafeteria.app.n8n.cloud/webhook/crear-pedido";

      const body = esDomicilio
        ? { items: cartItems.map(i => ({ id: i.id, qty: i.qty })) }
        : { mesa, token, items: cartItems.map(i => ({ id: i.id, qty: i.qty })) };

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
    }
  };

  return (
    <div className="p-4 bg-zinc-900 text-white rounded-lg shadow-lg border border-zinc-800">
      <h2 className="text-xl font-bold mb-4 text-yellow-500">Tu Pedido</h2>
      {cartItems.length === 0 ? (
        <p className="text-zinc-400">El carrito está vacío.</p>
      ) : (
        <ul className="space-y-2 mb-4">
          {cartItems.map((item) => (
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
        disabled={cartItems.length === 0 || cargando}
        className="w-full mt-4 bg-yellow-600 hover:bg-yellow-500 text-black font-bold py-2 px-4 rounded transition-colors disabled:opacity-50"
      >
        {cargando ? "Procesando..." : "Pagar"}
      </button>
    </div>
  );
}