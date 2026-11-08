import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/**
 * Cliente de Supabase para el navegador.
 * Si faltan las variables de entorno, se crea con URL vacía y fallará
 * solo en runtime cuando se intente usar (no romperá el build).
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/** Cliente de servidor con service_role. Solo usar en rutas API / server actions. */
export function supabaseAdmin() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY no está definida");
  }
  return createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
