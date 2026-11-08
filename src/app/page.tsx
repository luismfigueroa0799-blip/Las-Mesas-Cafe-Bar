"use client";

import Link from "next/link";
import { Scan, Clock, MapPin, Sparkles } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-negro/5 bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2 text-xl font-serif font-bold tracking-tight">
              <span className="text-dorado">LM</span> Las Mesas Café Bar
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              <Link
                href="/"
                className="hover:text-dorado transition-colors"
                aria-current="page"
              >
                Inicio
              </Link>
              <Link
                href="/domicilio"
                className="hover:text-dorado transition-colors"
              >
                Pedido para llevar
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-negro mb-4 tracking-tight">
            Pide desde tu mesa
          </h1>
          <p className="text-lg text-negro/70 max-w-2xl mx-auto">
            Escanea el código QR de tu mesa, elige lo que quieras y paga con
            tarjeta. Todo se envía directamente a la barra de
            <strong>Las Mesas Café Bar</strong>.
          </p>
        </div>

        <section className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Scan className="text-dorado" />}
            titulo="Escanea tu mesa"
            descripcion={
              <>
                Cada mesa tiene su propio QR. Al entrar en <code>/mesa/[id]</code>
                la mesa queda fijada y no se puede cambiar.
              </>
            }
          />
          <FeatureCard
            icon={<Clock className="text-dorado" />}
            titulo="Precios validados"
            descripcion={
              <>
                El frontend nunca envía precios. n8n recalcula el total contra
                la base de datos antes de aceptar el pedido.
              </>
            }
          />
          <FeatureCard
            icon={<MapPin className="text-dorado" />}
            titulo="Para llevar"
            descripcion={
              <>
                Ruta independiente <code>/domicilio</code>. Completa nombre,
                teléfono y dirección.
              </>
            }
          />
        </section>

        <div className="mt-16 flex flex-col items-center gap-4">
          <p className="text-negro/60">¿Desde qué vas a pedir?</p>
          <div className="flex gap-3">
            <Link href="/mesa/1" className="btn-dorado">
              <Scan className="w-5 h-5 mr-2" /> Mesa
            </Link>
            <Link href="/domicilio" className="btn-blanco">
              <MapPin className="w-5 h-5 mr-2" /> Domicilio
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-negro/5 bg-white mt-auto py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-negro/60">
          Las Mesas Café Bar · Pintor Antonio Padrón 59, Las Mesas Bajas,
          Gran Canaria · Tel. 928 896 097
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  titulo,
  descripcion,
}: {
  icon: React.ReactNode;
  titulo: string;
  descripcion: React.ReactNode;
}) {
  return (
    <div className="card-producto p-6">
      <div className="w-12 h-12 rounded-xl bg-dorado/10 flex items-center justify-center mb-4 text-dorado">
        {icon}
      </div>
      <h3 className="font-serif font-bold text-negro mb-2">{titulo}</h3>
      <p className="text-sm text-negro/60 leading-relaxed">{descripcion}</p>
    </div>
  );
}
