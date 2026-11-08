"use client";

import Link from "next/link";
import { Menu, Phone, MapPin, Coffee } from "lucide-react";
import { useState } from "react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-negro/90 backdrop-blur-xs border-b border-borde">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Las Mesas Cafe Bar"
              className="w-10 h-10 rounded-full object-cover border border-dorado/30"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect fill='%230a0a0a' width='100' height='100'/%3E%3Ccircle cx='50' cy='50' r='40' fill='none' stroke='%23d4aa58' stroke-width='4'/%3E%3Cpath d='M50 30l5 12 13 2-10 9 3 13L50 58l-11 6 3-13-10-9 13-2z' fill='%23d4aa58'/%3E%3C/svg%3E";
              }}
            />
            <span className="texto-elegante text-xl font-bold tracking-widest text-blanco">
              Las Mesas
            </span>
            <span className="texto-elegante text-xs font-bold text-dorado tracking-wider uppercase">
              Cafe Bar
            </span>
          </Link>

          {/* Navegación */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className="text-sm font-medium text-texto-secundario hover:text-dorado transition-colors"
            >
              Inicio
            </Link>
            <Link
              href="/domicilio"
              className="text-sm font-medium text-texto-secundario hover:text-dorado transition-colors flex items-center gap-1.5"
            >
              <MapPin className="w-4 h-4" />
              Domicilio
            </Link>
          </nav>

          {/* Acciones */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMenuOpen(true)}
              className="md:hidden text-dorado"
              aria-label="Abrir menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            <Link
              href="/domicilio"
              className="hidden sm:inline-flex btn-dorado-blanco text-xs"
            >
              <Phone className="w-4 h-4 mr-2" />
              Pedir a domicilio
            </Link>
          </div>
        </div>
      </div>

      {/* Menu movil */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-negro/95">
          <div className="absolute top-0 right-0 p-4">
            <button
              onClick={() => setMenuOpen(false)}
              className="text-dorado"
              aria-label="Cerrar menu"
            >
              X
            </button>
          </div>
          <div className="p-8 pt-20 space-y-6">
            <Link
              href="/"
              onClick={() => setMenuOpen(false)}
              className="text-2xl texto-elegante font-bold text-blanco hover:text-dorado transition-colors block"
            >
              Inicio
            </Link>
            <Link
              href="/domicilio"
              onClick={() => setMenuOpen(false)}
              className="text-lg font-medium text-texto hover:text-dorado transition-colors block flex items-center gap-3"
            >
              <MapPin className="w-5 h-5 text-dorado" />
              Pedir a domicilio
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
