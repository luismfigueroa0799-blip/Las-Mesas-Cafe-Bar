"use client";

import { useState } from "react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-portada-fallback text-[var(--blanco)] relative overflow-x-hidden">
      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative-z-10">
        <div className="text-center">
          {/* Logo */}
          <div className="mx-auto mb-12">
            <img
              src="/logo.png"
              alt="Las Mesas Cafe Bar"
              className="w-24 h-24 rounded-full object-cover border border-dorado/30 transition-all duration-300 hover:border-dorado"
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
            >
              Pedir a Domicilio
            </Link>

            {/* Texto secundario: QR */}
            <div className="flex items-center gap-2 text-[var(--texto-secundario)] text-sm">
              <span>Si estás en el local, escanea el QR de tu mesa</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}