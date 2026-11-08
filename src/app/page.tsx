"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Coffee, CreditCard, ShieldCheck, MapPin, ArrowRight } from "lucide-react";
import Header from "@/components/Header";

export default function HomePage() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const features = [
    {
      icon: <MapPin className="w-6 h-6 text-dorado" />,
      title: "Envio a tu mesa",
      description: "Escanea el codigo QR de tu mesa, elige lo que quieras y paga con tarjeta. Todo se envia directamente a la barra.",
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-dorado" />,
      title: "Precios validados",
      description: "El frontend nunca envia precios. n8n recalcula el total contra la base de datos antes de aceptar el pago.",
    },
    {
      icon: <CreditCard className="w-6 h-6 text-dorado" />,
      title: "Pago Seguro",
      description: "Pagos procesados mediante Stripe Checkout. Tus datos estan protegidos con cifrado de nivel bancario.",
    },
  ];

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">
      {/* Fondo decorativo sutil */}
      <div className="fixed inset-0 -z-10 bg-negro" />
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 -top-24 w-[600px] h-[600px] rounded-full bg-dorado/10 blur-[120px] pointer-events-none"
        style={{ filter: "opacity(0.4)" }}
      />
      <div
        className="fixed bottom-0 right-1/2 -translate-x-1/2 -bottom-24 w-[500px] h-[500px] rounded-full bg-dorado/10 blur-[100px] pointer-events-none"
        style={{ filter: "opacity(0.3)" }}
      />

      <Header />

      <main className="flex-1 relative">
        {/* Hero */}
        <section className="relative min-h-[70vh] flex items-center justify-center pt-20 pb-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="relative z-10 max-w-7xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-dorado/10 border border-dorado/20 text-dorado-claro text-xs font-bold uppercase tracking-wider mb-8 animate-fade-in">
              <span className="relative flex h-2 w-2">
                <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-dorado opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-dorado"></span>
              </span>
              Abierto hoy hasta las 23:00
            </div>
            <h1 className="texto-elegante text-5xl md:text-7xl lg:text-8xl font-bold text-blanco leading-tight mb-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
              Pide desde tu<span className="block text-dorado"> mesa</span>
            </h1>
            <p className="text-lg md:text-xl text-texto-secundario max-w-2xl mx-auto mb-10 animate-fade-in" style={{ animationDelay: "0.2s" }}>
              Escanea el codigo QR de tu mesa, elige lo que quieras del menu y paga con tarjeta. Todo llega directamente a la barra de Las Mesas Cafe Bar.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <Link
                href="/mesa/1?token=tok_prueba_mesa1"
                className="btn-dorado-blanco px-10 py-4 text-sm font-bold tracking-widest uppercase flex items-center justify-center gap-2"
              >
                <ArrowRight className="w-4 h-4" />
                Ver mesa 1
              </Link>
              <Link
                href="/domicilio"
                className="btn-outline-dorado px-10 py-4 text-sm font-bold tracking-widest uppercase flex items-center justify-center gap-2"
              >
                Pedir a domicilio
              </Link>
            </div>
          </div>

          {/* Imagen decorativa del hero (placeholder elegante) */}
          <div className="absolute inset-0 bg-gradient-to-b from-negro via-negro/50 to-negro pointer-events-none" />
          <div
            className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1559339352-11d035aa65de?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center opacity-20"
            aria-hidden="true"
          />
        </section>

        {/* Caracteristicas */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <div
                key={i}
                className="p-8 rounded-3xl bg-negro-card border border-borde hover:border-dorado/30 transition-all duration-300 group animate-fade-in"
                style={{ animationDelay: `${0.1 + i * 0.1}s` }}
              >
                <div className="w-12 h-12 rounded-xl bg-dorado/10 flex items-center justify-center mb-6 group-hover:bg-dorado group-hover:text-negro transition-colors">
                  {f.icon}
                </div>
                <h3 className="texto-elegante text-xl font-bold text-blanco mb-4">{f.title}</h3>
                <p className="text-texto-secundario leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA inferior */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="rounded-3xl bg-dorado p-12 md:p-20 border border-dorado/20 shadow-dorado">
              <h2 className="texto-elegante text-3xl md:text-4xl font-bold text-negro mb-4">
                Listo para pedir
              </h2>
              <p className="text-negro/70 text-lg mb-8">
                Escanea el QR de tu mesa o pide para llevar. Disfruta de Las Mesas Cafe Bar desde donde estes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/mesa/1?token=tok_prueba_mesa1"
                  className="btn-dorado text-negro px-12 py-4 text-sm font-bold tracking-widest uppercase"
                >
                  Ir a la mesa
                </Link>
                <Link
                  href="/domicilio"
                  className="btn-outline-dorado text-dorado px-12 py-4 text-sm font-bold tracking-widest uppercase border-dorado"
                >
                  Pedir a domicilio
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-borde/30 bg-negro/50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Las Mesas Cafe Bar"
              className="w-8 h-8 rounded-full object-cover border border-dorado/30"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect fill='%230a0a0a' width='100' height='100'/%3E%3Ccircle cx='50' cy='50' r='40' fill='none' stroke='%23d4aa58' stroke-width='4'/%3E%3Cpath d='M50 30l5 12 13 2-10 9 3 13L50 58l-11 6 3-13-10-9 13-2z' fill='%23d4aa58'/%3E%3C/svg%3E";
              }}
            />
            <span className="texto-elegante font-bold text-blanco tracking-widest">
              Las Mesas Cafe Bar
            </span>
          </div>
          <p className="text-xs text-texto-secundario/50">
            Pintor Antonio Padron 59, Las Mesas Bajas, Gran Canaria · Tel. 928 896 097
          </p>
          <div className="flex gap-4">
            <a href="#" className="text-texto-secundario hover:text-dorado transition-colors">
              Instagram
            </a>
            <a href="#" className="text-texto-secundario hover:text-dorado transition-colors">
              TikTok
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
