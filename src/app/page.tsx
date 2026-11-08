export default function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--negro)] text-[var(--texto-blanco)] relative">
      {/* Hero Section - Idéntica al diseño original */}
      <section className="relative pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <div className="mx-auto mb-8 text-center">
            <a href="/" className="flex items-center gap-3">
              <img 
                src="/logo.png" 
                alt="Las Mesas Cafe Bar" 
                className="w-14 h-14 rounded-full object-cover border border-[var(--dorado)]/30 transition-colors hover:border-[var(--dorado)]"
                decoding="async"
              />
              <span className="hidden sm:block text-2xl font-bold tracking-widest uppercase text-[var(--dorado)]">LAS MESAS</span>
            </a>
          </div>

          {/* Main Title */}
          <div className="text-center mb-12">
            <h1 className="texto-elegante text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-4">
              Pizzería Hamburguesería<br/>
              <span className="block text-[var(--dorado)]">Las Mesas</span>
            </h1>
            <p className="text-lg text-[var(--texto-secundario)] max-w-2xl mx-auto">
              Momentos que se comparten. Café, copas y experiencias con alma. Una mesa para llegar sin prisas.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 max-w-md mx-auto">
            {/* Botón Principal: Pedir a Domicilio */}
            <a href="/domicilio" 
               className="btn-dorado w-full sm:w-auto">
              Pedir a Domicilio
            </a>

            {/* Botón Secundario: Reserva en Mesa */}
            <a href="/mesa" 
               className="btn-outline-dorado w-full sm:w-auto">
              Reserva tu Mesa
            </a>
          </div>

          {/* QR Info */}
          <div className="mt-8 text-center text-sm text-[var(--texto-secundario)]">
            <p>Si estás en el local, escanea el QR de tu mesa</p>
          </div>

          {/* Horario */}
          <div className="mt-12 grid grid-cols-2 gap-4 text-sm text-[var(--texto-secundario)] max-w-md mx-auto">
            <div>
              <strong>Lunes a Viernes</strong><br/>
              18:00 - 23:00
            </div>
            <div>
              <strong>Sábado</strong><br/>
              12:00 - 15:00 y 18:00 - 23:00
            </div>
            <div>
              <strong>Domingo</strong><br/>
              12:00 - 17:00
            </div>
          </div>
        </div>
      </section>

      {/* Nav Preview (simulación del header fixed) */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--negro)]/90 backdrop-blur-xs border-b border-[var(--borde)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <a href="/" className="flex items-center gap-3">
              <img 
                src="/logo.png" 
                alt="Las Mesas Cafe Bar" 
                className="w-10 h-10 rounded-full object-cover border border-[var(--dorado)]/30"
                decoding="async"
              />
              <span className="hidden sm:block text-xl font-bold tracking-widest uppercase text-[var(--dorado)]">Las Mesas</span>
            </a>
            
            <nav className="hidden md:flex items-center gap-8">
              <a href="/#inicio" className="text-[var(--texto-secundario)] hover:text-[var(--dorado)] transition-colors">Inicio</a>
              <a href="/carta" className="text-[var(--texto-secundario)] hover:text-[var(--dorado)] transition-colors">Carta</a>
              <a href="/domicilio" className="text-[var(--texto-secundario)] hover:text-[var(--dorado)] transition-colors">Domicilio</a>
            </nav>
            
            <div className="flex items-center gap-4">
              <a href="tel:+34928896097" className="text-[var(--texto-secundario)] hover:text-[var(--dorado)] transition-colors">
                +34 928 896 097
              </a>
              <a href="https://wa.me/34601163933" target="_blank" rel="noopener" className="text-[var(--dorado)] hover:text-[var(--crema)] transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M16 3a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h10z"/>
                  <path d="M9 8.5c0 3.5 3 6.5 6.5 6.5l1-1.5-2-1-.8.8c-1-.4-2-1.4-2.4-2.4l.8-.8-1-2L9 8.5z"/>
                </svg>
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}