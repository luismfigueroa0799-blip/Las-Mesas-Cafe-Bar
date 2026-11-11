"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle, CreditCard, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";

function PedidoConfirmadoContenido() {
  const searchParams = useSearchParams();
  const pedidoId = searchParams.get("id") ?? "";
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sid = params.get("session_id");
    if (sid) setSessionId(sid);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-6 text-center bg-negro">
      <div className="w-20 h-20 rounded-full bg-dorado/15 border border-dorado/40 flex items-center justify-center mx-auto mb-6 text-dorado">
        <CheckCircle className="w-10 h-10" />
      </div>

      <h1 className="texto-elegante text-3xl font-bold text-blanco mb-2">
        ¡Pedido recibido!
      </h1>

      <p className="text-texto-secundario mb-8">
        {pedidoId ? (
          <>
            Pedido <span className="font-mono font-bold text-dorado">#{pedidoId}</span>
          </>
        ) : (
          "Estamos confirmando tu pedido"
        )}
        {sessionId ? (
          <>
            {" · "}Sesión{" "}
            <span className="font-mono text-xs text-texto-secundario/70">
              …{sessionId.slice(-6)}
            </span>
          </>
        ) : null}
      </p>

      <div className="bg-[#141414] border border-borde rounded-3xl p-8 inline-block max-w-md">
        <div className="flex items-center gap-3 mb-4">
          <CreditCard className="w-5 h-5 text-dorado" />
          <span className="font-semibold text-blanco">Pago con tarjeta</span>
        </div>

        <p className="text-sm text-texto-secundario mb-4">
          Completa el pago con tarjeta. Una vez pagado, el personal del bar
          confirmará el pedido y lo enviará a cocina.
        </p>

        <p className="text-xs text-dorado/70 mb-6 uppercase tracking-wider">
          Estado: pendiente de confirmación
        </p>

        <Link href="/" className="btn-dorado">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}

export default function PedidoConfirmado() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-negro">
          <Loader2 className="w-10 h-10 text-dorado animate-spin" />
        </div>
      }
    >
      <PedidoConfirmadoContenido />
    </Suspense>
  );
}
