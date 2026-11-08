-- ============================================================
-- Las Mesas Café Bar · Sistema de pedidos (mesa + domicilio)
-- Esquema Supabase (Postgres). Ejecutar en el SQL Editor.
-- ============================================================

create extension if not exists pgcrypto;

-- ------------------------------------------------------------
-- productos
-- Única fuente de verdad de precios. n8n recalcula desde aquí.
-- ------------------------------------------------------------
create table if not exists public.productos (
  id          text primary key check (id ~ '^[a-z0-9_]+$'),
  nombre      text not null,
  precio      numeric(10,2) not null check (precio >= 0),
  categoria   text not null default 'general',
  disponible  boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ------------------------------------------------------------
-- mesas (8 mesas, cada una con su QR)
-- ------------------------------------------------------------
create table if not exists public.mesas (
  id              integer primary key check (id between 1 and 8),
  token_actual    text,
  token_expira_at timestamptz,
  created_at      timestamptz not null default now()
);

insert into public.mesas (id)
select g from generate_series(1, 8) as g
on conflict (id) do nothing;

-- ------------------------------------------------------------
-- pedidos
-- Estados:
--   pendiente_pago       → cliente aún no paga (checkout creado)
--   pendiente_confirmacion → pagó, espera confirmación del personal
--   pagado               → personal verificó (últimos pedidos pagados)
--   preparando           → en cocina
--   listo                → listo para servir
--   entregado            → servido al cliente
--   rechazado_reembolsado → rechazado, dinero devuelto
--   cancelado            → nunca pagó (timeout)
-- ------------------------------------------------------------
create table if not exists public.pedidos (
  id                 uuid primary key default gen_random_uuid(),
  mesa_id            integer references public.mesas(id),
  tipo               text not null check (tipo in ('mesa', 'domicilio')),
  items              jsonb not null check (jsonb_typeof(items) = 'array'),
  total              numeric(10,2) not null check (total >= 0),
  estado             text not null default 'pendiente_confirmacion'
                     check (estado in (
                       'pendiente_pago',
                       'pendiente_confirmacion',
                       'pagado',
                       'preparando',
                       'listo',
                       'entregado',
                       'rechazado_reembolsado',
                       'cancelado'
                     )),
  cliente_nombre     text,
  cliente_telefono   text,
  direccion          text,
  stripe_session_id  text unique,
  stripe_payment_intent text,
  pagado_at          timestamptz,
  created_at         timestamptz not null default now(),

  constraint pedidos_coherencia_check check (
    (tipo = 'mesa'      and mesa_id is not null) or
    (tipo = 'domicilio' and direccion is not null and cliente_telefono is not null and cliente_nombre is not null)
  )
);

create index if not exists pedidos_created_at_idx on public.pedidos (created_at desc);
create index if not exists pedidos_estado_idx     on public.pedidos (estado);
create index if not exists pedidos_stripe_session_idx on public.pedidos (stripe_session_id);

-- ------------------------------------------------------------
-- webhook_events (idempotencia de Stripe)
-- Evita procesar dos veces el mismo evento si Stripe reintenta.
-- ------------------------------------------------------------
create table if not exists public.webhook_events (
  id          text primary key,  -- stripe_event_id (evt_...)
  tipo        text not null,
  pedido_id   uuid references public.pedidos(id),
  procesado_en timestamptz not null default now(),
  payload     jsonb
);

-- ------------------------------------------------------------
-- Seguridad a nivel de fila (RLS)
-- ------------------------------------------------------------
alter table public.productos enable row level security;
alter table public.pedidos   enable row level security;
alter table public.mesas     enable row level security;
alter table public.webhook_events enable row level security;

-- Carta pública (solo lectura, solo disponibles)
drop policy if exists "carta_publica" on public.productos;
create policy "carta_publica" on public.productos
  for select to anon, authenticated using (disponible = true);

-- pedidos, mesas y webhook_events: SIN políticas públicas.
-- Toda mutación sale de n8n o rutas API del servidor con service_role.

-- ------------------------------------------------------------
-- Carta de ejemplo
-- ------------------------------------------------------------
insert into public.productos (id, nombre, precio, categoria) values
  ('espresso',       'Espresso',                    1.40, 'café'),
  ('cortado',        'Cortado',                     1.60, 'café'),
  ('con_leche',      'Café con leche',              1.80, 'café'),
  ('cappuccino',     'Cappuccino',                  2.50, 'café'),
  ('tostada_tomate', 'Tostada con tomate y AOVE',   3.20, 'tostadas'),
  ('tostada_jamon',  'Tostada con jamón serrano',   5.50, 'tostadas'),
  ('croissant',      'Croissant',                   1.90, 'bollería'),
  ('napolitana',     'Napolitana de chocolate',     2.30, 'bollería'),
  ('mixto',          'Bocadillo mixto',             4.00, 'bocadillos'),
  ('atun',           'Bocadillo de atún',           4.50, 'bocadillos'),
  ('zumo_naranja',   'Zumo de naranja natural',     3.50, 'bebidas'),
  ('agua_mineral',   'Agua mineral 50 cl',          1.20, 'bebidas'),
  ('refresco',       'Refresco 33 cl',              2.00, 'bebidas')
on conflict (id) do nothing;
