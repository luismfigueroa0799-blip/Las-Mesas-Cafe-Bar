"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle, CreditCard, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";

function PedidoExitosoContenido() {
  const searchParams = useSearchParams();
  const pedidoId = searchParams.get("id") ?? "";
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sid = params.get("session_id");
    if (sid) setSessionId(sid);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6 text-green-600">
        <CheckCircle className="w-10 h-10" />
      </div>
      <h1 className="text-3xl font-serif font-bold text-negro mb-2">
        ¡Pedido recibido!
      </h1>
      <p className="text-negro/60 mb-6">
        Pedido <span className="font-mono font-bold">#{pedidoId}</span>
        {" · "}
        {sessionId ? (
          <>
            Sesión de pago{" "}
            <span className="font-mono text-xs text-negro/40">
              …{sessionId.slice(-6)}
            </span>
          </>
        ) : (
          <span className="text-xs text-negro/40">en validación</span>
        )}
      </p>
      <div className="bg-white p-6 rounded-2xl border border-negro/5 shadow-sm inline-block">
        <div className="flex items-center gap-3 mb-4">
          <CreditCard className="w-5 h-5 text-dorado" />
          <span className="font-semibold text-negro">Pago con tarjeta</span>
        </div>
        <p className="text-sm text-negro/50 mb-4">
          Completa el pago con tarjeta. Una vez pagado, el personal del bar
          confirmará el pedido y lo enviará a cocina.
        </p>
        <p className="text-xs text-negro/30 mb-4 uppercase tracking-wider">
          Estado: pendiente de confirmación
        </p>
        <Link href="/" className="btn-blanco">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}

export default function PedidoExitoso() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-dorado animate-spin" />
        </div>
      }
    >
      <PedidoExitosoContenido />
    </Suspense>
  );
}
