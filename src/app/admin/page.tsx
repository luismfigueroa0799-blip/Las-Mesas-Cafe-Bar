"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  CheckCircle,
  RefreshCw,
  AlertTriangle,
  Clock,
  CreditCard,
  MapPin,
  Phone,
  X,
} from "lucide-react";

const ADMIN_TOKEN = process.env.NEXT_PUBLIC_ADMIN_TOKEN ?? "";

interface PedidoAdmin {
  id: string;
  mesa_id: number | null;
  tipo: "mesa" | "domicilio";
  items: Array<{
    id: string;
    nombre: string;
    unit: number;
    qty: number;
    subtotal: number;
  }>;
  total: number;
  estado:
    | "pendiente_pago"
    | "pendiente_confirmacion"
    | "pagado"
    | "preparando"
    | "listo"
    | "entregado"
    | "rechazado_reembolsado"
    | "cancelado";
  cliente_nombre: string | null;
  cliente_telefono: string | null;
  direccion: string | null;
  stripe_session_id: string | null;
  stripe_payment_intent: string | null;
  pagado_at: string | null;
  created_at: string;
}

const ETIQUETAS_ESTADO: Record<string, string> = {
  pendiente_pago: "Pendiente de pago",
  pendiente_confirmacion: "Pendiente de confirmar",
  pagado: "Pagado",
  preparando: "En cocina",
  listo: "Listo para servir",
  entregado: "Entregado",
  rechazado_reembolsado: "Rechazado + reembolsado",
  cancelado: "Cancelado",
};

const itemsHTML = (items: PedidoAdmin["items"]) =>
  items.map((it) => `${it.nombre} ×${it.qty}`).join(", ");

const COLORES_ESTADO: Record<string, string> = {
  pendiente_pago: "bg-amber-50 text-amber-700 border-amber-100",
  pendiente_confirmacion: "bg-rose-50 text-rose-700 border-rose-100",
  pagado: "bg-blue-50 text-blue-700 border-blue-100",
  preparando: "bg-indigo-50 text-indigo-700 border-indigo-100",
  listo: "bg-green-50 text-green-700 border-green-100",
  entregado: "bg-gray-50 text-gray-700 border-gray-100",
  rechazado_reembolsado: "bg-red-50 text-red-700 border-red-100",
  cancelado: "bg-gray-100 text-gray-500 border-gray-200",
};

export default function AdminPanel() {
  const [pedidos, setPedidos] = useState<PedidoAdmin[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rechazandoId, setRechazandoId] = useState<string | null>(null);
  const [confirmandoId, setConfirmandoId] = useState<string | null>(null);

  const fetchPedidos = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/pedidos?estado=pendiente_confirmacion", {
        headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
      });
      if (!res.ok) throw new Error("No autorizado");
      const data = await res.json();
      setPedidos(data.pedidos ?? []);
    } catch (err: any) {
      setError(err.message || "Error cargando pedidos");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    fetchPedidos();

    // Realtime con Supabase (recarga cuando cambie un pedido)
    // Nota: esto usa la clave anon pública; el canal solo escucha cambios.
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (typeof window !== "undefined" && supabaseUrl && supabaseAnon) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { createClient } = require("@supabase/supabase-js");
      const supabase = createClient(supabaseUrl, supabaseAnon);

      const channel = supabase
        .channel("pedidos-admin")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "pedidos",
          },
          () => {
            fetchPedidos();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [fetchPedidos]);

  const confirmarPedido = async (id: string, nuevoEstado: "preparando" | "listo") => {
    setConfirmandoId(id);
    try {
      const res = await fetch(
        `/api/admin/pedidos/${id}/confirmar`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${ADMIN_TOKEN}`,
          },
          body: JSON.stringify({ estado: nuevoEstado }),
        }
      );
      if (!res.ok) throw new Error("No se pudo confirmar");
      await fetchPedidos();
    } catch (err: any) {
      setError(err.message || "Error confirmando pedido");
    } finally {
      setConfirmandoId(null);
    }
  };

  const rechazarPedido = async (id: string) => {
    setRechazandoId(id);
    try {
      const res = await fetch(`/api/admin/pedidos/${id}/rechazar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${ADMIN_TOKEN}`,
        },
      });
      if (!res.ok) throw new Error("No se pudo rechazar");
      await fetchPedidos();
    } catch (err: any) {
      setError(err.message || "Error rechazando pedido");
    } finally {
      setRechazandoId(null);
    }
  };

  const pendientes = pedidos.filter(
    (p) => p.estado === "pendiente_confirmacion"
  );
  const enCocina = pedidos.filter(
    (p) => p.estado === "preparando" || p.estado === "pagado"
  );
  const listos = pedidos.filter((p) => p.estado === "listo");

  return (
    <div className="min-h-screen bg-negro/5">
      {/* Header */}
      <header className="bg-white border-b border-negro/10 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2 text-xl font-serif font-bold tracking-tight">
              <span className="text-dorado">LM</span> Las Mesas Café Bar
            </Link>
            <div className="flex items-center gap-4">
              <span className="px-3 py-1 rounded-full bg-dorado text-negro text-xs font-bold">
                PANEL ADMIN
              </span>
              <Link
                href="/"
                className="px-4 py-2 text-sm font-medium text-negro/60 hover:text-dorado transition-colors"
              >
                Volver a la web
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="rounded-lg bg-rose-50 p-4 border border-rose-100 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-rose-800">Error</h3>
                <p className="text-xs text-rose-600">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="text-3xl font-serif font-bold text-negro">Pedidos del local</h1>
            <p className="text-negro/60">
              Gestiona la cola de pedidos de mesas y domicilio.
            </p>
          </div>
          <button
            onClick={fetchPedidos}
            disabled={cargando}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-negro/10 bg-white text-sm font-medium text-negro hover:bg-negro/5 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${cargando ? "animate-spin" : ""}`} />
            {cargando ? "Cargando..." : "Refrescar"}
          </button>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Pendientes de confirmar"
            valor={pendientes.length}
            color="text-rose-600"
            bg="bg-rose-50"
            border="border-rose-100"
          />
          <StatCard
            title="En cocina"
            valor={enCocina.length}
            color="text-indigo-600"
            bg="bg-indigo-50"
            border="border-indigo-100"
          />
          <StatCard
            title="Listos para servir"
            valor={listos.length}
            color="text-green-600"
            bg="bg-green-50"
            border="border-green-100"
          />
          <StatCard
            title="Total hoy"
            valor={pedidos.length}
            color="text-negro"
            bg="bg-negro/5"
            border="border-negro/10"
          />
        </div>

        {/* Columnas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna 1: Pendientes de confirmar */}
          <Columna
            titulo="Pendientes de confirmar"
            icon={<Clock className="w-5 h-5 text-rose-600" />}
            color="rose"
            pedidos={pendientes}
            onConfirmar={(id) => confirmarPedido(id, "preparando")}
            onRechazar={(id) => rechazarPedido(id)}
            cargando={cargando || confirmandoId !== null || rechazandoId !== null}
            ocupadoId={confirmandoId ?? rechazandoId ?? null}
          />

          {/* Columna 2: En cocina */}
          <Columna
            titulo="En cocina"
            icon={<CreditCard className="w-5 h-5 text-indigo-600" />}
            color="indigo"
            pedidos={enCocina}
            onConfirmar={(id) => confirmarPedido(id, "listo")}
            onRechazar={() => {}}
            cargando={cargando || confirmandoId !== null}
            ocupadoId={confirmandoId ?? null}
          />

          {/* Columna 3: Listos para servir */}
          <Columna
            titulo="Listos para servir"
            icon={<CheckCircle className="w-5 h-5 text-green-600" />}
            color="green"
            pedidos={listos}
            onConfirmar={() => {}}
            onRechazar={() => {}}
            cargando={false}
            ocupadoId={null}
          />
        </div>

        {/* Footer */}
        <div className="mt-12 border-t border-negro/10 pt-6">
          <p className="text-xs text-negro/40 text-center">
            Las Mesas Café Bar · Panel de administración · Protegido con token
          </p>
        </div>
      </main>
    </div>
  );
}

function StatCard({
  title,
  valor,
  color,
  bg,
  border,
}: {
  title: string;
  valor: number;
  color: string;
  bg: string;
  border: string;
}) {
  return (
    <div className={`rounded-xl p-4 ${bg} ${border}`}>
      <p className="text-xs font-semibold text-negro/40 uppercase tracking-wider mb-1">
        {title}
      </p>
      <p className="text-2xl font-serif font-bold {color}">{valor}</p>
    </div>
  );
}

function Columna({
  titulo,
  icon,
  color,
  pedidos,
  onConfirmar,
  onRechazar,
  cargando,
  ocupadoId,
}: {
  titulo: string;
  icon: React.ReactNode;
  color: "rose" | "indigo" | "green";
  pedidos: PedidoAdmin[];
  onConfirmar: (id: string) => void;
  onRechazar: (id: string) => void;
  cargando: boolean;
  ocupadoId: string | null;
}) {
  const colorMap = {
    rose: "bg-rose-50 text-rose-700 border-rose-100",
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-100",
    green: "bg-green-50 text-green-700 border-green-100",
  };

  return (
    <div className="flex flex-col h-full">
      <div className={`rounded-xl p-4 mb-4 border ${colorMap[color]}`}>
        <div className="flex items-center gap-2 mb-2">
          {icon}
          <h3 className="font-serif font-bold text-lg">{titulo}</h3>
        </div>
        <p className="text-xs text-negro/50">{pedidos.length} pedido(s)</p>
      </div>

      <div className="flex-1 min-h-[400px]">
        {pedidos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-negro/40">
            <p className="text-sm">Sin pedidos</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pedidos.map((pedido) => {
              const ocupado = ocupadoId === pedido.id;
              const esPendiente = pedido.estado === "pendiente_confirmacion";
              return (
                <div
                  key={pedido.id}
                  className="bg-white rounded-xl border border-negro/10 p-4 shadow-sm"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-serif font-bold text-negro">
                        {pedido.tipo === "mesa"
                          ? `Mesa ${pedido.mesa_id}`
                          : "Domicilio"}
                      </p>
                      <p className="text-xs font-mono text-negro/40">
                        #{pedido.id.slice(0, 8)}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${COLORES_ESTADO[pedido.estado]}`}>
                      {ETIQUETAS_ESTADO[pedido.estado]}
                    </span>
                  </div>

                  <div className="mb-3">
                    <p className="text-sm text-negro/70 mb-1">
                      {itemsHTML(pedido.items)}
                    </p>
                    <p className="text-sm font-serif font-bold text-negro">
                      {pedido.total.toFixed(2)} €
                    </p>
                  </div>

                  {pedido.tipo === "domicilio" && (
                    <div className="mb-3 p-3 rounded-lg bg-negro/5 text-xs text-negro/60">
                      <div className="flex items-center gap-1 mb-1">
                        <Phone className="w-3 h-3" />
                        <span>{pedido.cliente_telefono}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span className="line-clamp-1">{pedido.direccion}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {esPendiente && (
                      <button
                        onClick={() => onConfirmar(pedido.id)}
                        disabled={ocupado}
                        className={`flex-1 py-2 rounded-lg font-semibold text-sm transition-all ${
                          ocupado
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                            : "bg-dorado text-negro hover:bg-dorado/90 border border-dorado/20"
                        }`}
                      >
                        {ocupado ? "Confirmando..." : "✓ Confirmar"}
                      </button>
                    )}
                    {esPendiente && (
                      <button
                        onClick={() => onRechazar(pedido.id)}
                        disabled={ocupado}
                        className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                          ocupado
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                            : "bg-white text-negro border border-negro/20 hover:bg-negro/5"
                        }`}
                      >
                        ✗ Rechazar
                      </button>
                    )}
                    {!esPendiente && (
                      <button
                        className="px-4 py-2 rounded-lg font-semibold text-sm text-negro/40 border border-negro/10 hover:bg-negro/5 transition-colors"
                      >
                        Ver detalle
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
