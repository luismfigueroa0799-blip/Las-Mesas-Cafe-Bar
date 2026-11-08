"use client";

import { useState } from "react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-zinc-900 text-white relative">
      {/* Fondo hero con gradiente */}
      <div className="absolute inset-0">
        <div className="bg-gradient-to-b from-zinc-900 via-zinc-900/80 to-zinc-900 absolute inset-0" />
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative-z-10">
        <div className="text-center">
          {/* Logo */}
          <div className="mx-auto mb-12">
            <img
              src="/logo.png"
              alt="Las Mesas Cafe Bar"
              className="w-24 h-24 rounded-full object-cover border border-dorado/30 transition-all duration-300 hover:border-dorado"
              loading="lazy"
            />
            <span className="hidden sm:block texto-elegante text-xl font-bold tracking-widest uppercase text-dorado">Las Mesas</span>
          </div>

          {/* Título principal */}
          <h1 className="texto-elegante text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
            Pizzería Hamburguesería<br />
            <span className="block text-dorado">Las Mesas</span>
          </h1>

          {/* Botones de acción */}
          <div className="mt-12 md:mt-16 gap-4 sm:gap-6 max-w-md mx-auto flex flex-col sm:flex-row justify-center">
            {/* Botón principal: Pedir a Domicilio */}
            <Link
              href="/domicilio"
              className="btn-dorado"
              style={{ marginRight: '1rem' }}
            >
              Pedir a Domicilio
            </Link>

            <Link
              href="/mesa"
              className="btn-outline-dorado"
            >
              Reserva tu Mesa
            </Link>

            {/* Texto secundario: QR */}
            <div className="flex items-center gap-2 text-[var(--texto-secundario)] text-sm">
              <span>Si estás en el local, escanea el QR de tu mesa</span>
            </div>
          </div>

          {/* Horario */}
          <div className="mt-16 text-sm text-[var(--texto-secundario)] max-w-md mx-auto">
            <p>Lunes a Viernes: 18:00 - 23:00</p>
            <p>Sábado: 12:00 - 15:00 y 18:00 - 23:00</p>
            <p>Domingo: 12:00 - 17:00</p>
          </div>
        </div>
      </main>
    </div>
  );
}