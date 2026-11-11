"use client";

import { useState } from "react";
import { CreditCard, Trash2, User, MapPin, Phone } from "lucide-react";

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
  onVaciar?: () => void;
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

export default function Carrito({
  mesa,
  token,
  items: propItems,
  total: propTotal,
  cargando,
  onPagar,
  onQuitarUno,
  onEliminar,
  onVaciar,
  tipo = "mesa",
  puedePagar,
  motivoSinPagar,
  nombre = "",
  setNombre,
  telefono = "",
  setTelefono,
  direccion = "",
  setDireccion,
}: CarritoProps) {
  // Usar items del prop si están disponibles, sino usar estado interno
  const [internalItems, setInternalItems] = useState<ItemCarrito[]>([]);
  const cartItems = propItems || internalItems;
  const total =
    propTotal !== undefined
      ? propTotal
      : cartItems.reduce((acc, item) => acc + item.precio * item.qty, 0);

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

  const vaciar = () => {
    setInternalItems([]);
    onVaciar?.();
  };

  const pagar = async () => {
    if (cartItems.length === 0) return;
    if (onPagar) {
      onPagar();
      return;
    }

    try {
      const esDomicilio = !mesa;
      const url = esDomicilio
        ? "https://barcafeteria.app.n8n.cloud/webhook/crear-pedido-domicilio"
        : "https://barcafeteria.app.n8n.cloud/webhook/crear-pedido";

      const body = esDomicilio
        ? { items: cartItems.map((i) => ({ id: i.id, qty: i.qty })) }
        : { mesa, token, items: cartItems.map((i) => ({ id: i.id, qty: i.qty })) };

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

  const hayContacto = tipo === "domicilio";

  return (
    <aside className="bg-negro border border-borde rounded-3xl overflow-hidden">
      {/* Cabecera */}
      <header className="px-6 py-5 border-b border-borde/60 flex items-center justify-between">
        <h2 className="texto-elegante text-xl font-bold text-blanco">Tu Pedido</h2>
        {tipo === "mesa" && mesa ? (
          <span className="pill-dorado">Mesa {mesa}</span>
        ) : tipo === "domicilio" ? (
          <span className="pill-dorado">A domicilio</span>
        ) : null}
      </header>

      {/* Artículos */}
      <div className="px-6 py-5">
        {cartItems.length === 0 ? (
          <p className="text-texto-secundario text-sm">
            El carrito está vacío. Añade productos desde la carta.
          </p>
        ) : (
          <ul className="space-y-3">
            {cartItems.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-3 pb-3 border-b border-borde/40 last:border-0 last:pb-0"
              >
                <span className="text-sm text-blanco">
                  <span className="text-dorado font-semibold">{item.qty}×</span>{" "}
                  {item.nombre}
                </span>
                <span className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-dorado whitespace-nowrap">
                    {(item.precio * item.qty).toFixed(2)} €
                  </span>
                  {onEliminar && (
                    <button
                      type="button"
                      onClick={() => onEliminar(item.id)}
                      aria-label={`Quitar ${item.nombre}`}
                      className="w-7 h-7 grid place-items-center rounded-full border border-borde text-texto-secundario hover:text-dorado hover:border-dorado transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Datos de contacto (solo para entrega a domicilio) */}
      {hayContacto && (
        <div className="px-6 pb-5 space-y-3">
          <label className="block">
            <span className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-texto-secundario mb-2">
              <User className="w-3.5 h-3.5 text-dorado" />
              Nombre completo
            </span>
            <input
              type="text"
              className="input-oscuro"
              value={nombre}
              onChange={(e) => setNombre?.(e.target.value)}
              placeholder="Nombre y apellidos"
              autoComplete="name"
              required
            />
          </label>

          <label className="block">
            <span className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-texto-secundario mb-2">
              <Phone className="w-3.5 h-3.5 text-dorado" />
              Teléfono
            </span>
            <input
              type="tel"
              className="input-oscuro"
              value={telefono}
              onChange={(e) => setTelefono?.(e.target.value)}
              placeholder="600 00 00 00"
              autoComplete="tel"
              required
            />
          </label>

          <label className="block">
            <span className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-texto-secundario mb-2">
              <MapPin className="w-3.5 h-3.5 text-dorado" />
              Dirección de entrega
            </span>
            <textarea
              className="input-oscuro min-h-[90px] resize-y"
              value={direccion}
              onChange={(e) => setDireccion?.(e.target.value)}
              placeholder="Calle, número, piso, código postal y población"
              autoComplete="street-address"
              required
            />
          </label>
        </div>
      )}

      {/* Total */}
      <div className="px-6 py-4 border-t border-borde/60 flex items-center justify-between">
        <span className="text-sm uppercase tracking-widest text-blanco font-semibold">
          Total
        </span>
        <span className="texto-elegante text-2xl font-bold text-dorado">
          {total.toFixed(2)} €
        </span>
      </div>

      {/* Pago */}
      <div className="px-6 pb-6 pt-2">
        {motivoSinPagar && <p className="aviso-carrito mb-4">{motivoSinPagar}</p>}

        <button
          type="button"
          onClick={pagar}
          disabled={
            cartItems.length === 0 || cargando || puedePagar === false
          }
          className="btn-dorado w-full gap-3 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:transform-none"
        >
          <CreditCard className="w-4 h-4" />
          {cargando ? "Procesando…" : "Pagar con Stripe"}
        </button>

        {cartItems.length > 0 && (
          <div className="mt-4 text-center">
            <button type="button" onClick={vaciar} className="texto-sutil">
              Vaciar carrito
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
