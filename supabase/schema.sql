-- ============================================================
-- Las Mesas Café Bar · Sistema de pedidos (mesa + domicilio)
-- Esquema Supabase (Postgres). Ejecutar en el SQL Editor.
-- ============================================================

create extension if not exists pgcrypto;

-- ------------------------------------------------------------
-- productos
-- El precio vive AQUÍ: única fuente de verdad. n8n recalcula
-- los totales desde esta tabla; el frontend nunca envía precios.
-- ------------------------------------------------------------
create table if not exists public.productos (
  id          text primary key check (id ~ '^[a-z0-9_]+$'),  -- slug estable, ej. 'cappuccino'
  nombre      text not null,
  precio      numeric(10,2) not null check (precio >= 0),
  categoria   text not null default 'general',
  disponible  boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ------------------------------------------------------------
-- mesas (8 mesas, cada una con su QR)
-- token_actual = token HMAC actual impreso en el QR de la mesa.
-- token_expira_at = caducidad del token (los QR se regeneran cada día).
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
-- items guarda las líneas ENRIQUECIDAS por n8n (nombre, unit, qty,
-- subtotal). El frontend solo envía {id, qty} sin precios.
-- ------------------------------------------------------------
create table if not exists public.pedidos (
  id                 uuid primary key default gen_random_uuid(),
  mesa_id            integer references public.mesas(id),
  tipo               text not null check (tipo in ('mesa', 'domicilio')),
  items              jsonb not null check (jsonb_typeof(items) = 'array'),
                     -- [{"id":"cappuccino","nombre":"Cappuccino","unit":2.50,"qty":2,"subtotal":5.00}]
  total              numeric(10,2) not null check (total >= 0),
  estado             text not null default 'pendiente_confirmacion'
                     check (estado in ('pendiente_confirmacion','pagado','preparando','entregado','cancelado')),
                     -- 'cancelado': añadido para pedidos sin pagar o sesiones Stripe expiradas
  cliente_nombre     text,
  cliente_telefono   text,
  direccion          text,
  stripe_session_id  text unique,
  created_at         timestamptz not null default now(),

  -- coherencia tipo/mesa y datos de domicilio
  constraint pedidos_coherencia_check check (
    (tipo = 'mesa'      and mesa_id is not null) or
    (tipo = 'domicilio' and direccion is not null and cliente_telefono is not null and cliente_nombre is not null)
  )
);

create index if not exists pedidos_created_at_idx on public.pedidos (created_at desc);
create index if not exists pedidos_estado_idx     on public.pedidos (estado);

-- ============================================================
-- Seguridad a nivel de fila (RLS)
-- ============================================================
alter table public.productos enable row level security;
alter table public.pedidos   enable row level security;
alter table public.mesas     enable row level security;

-- Solo la carta es pública (lectura) y solo lo disponible:
drop policy if exists "carta_publica" on public.productos;
create policy "carta_publica" on public.productos
  for select to anon, authenticated using (disponible = true);

-- pedidos y mesas: SIN políticas  =>  ni anon ni authenticated pueden
-- leerlas ni escribirlas con la clave pública. Toda mutación (crear
-- pedido, marcar pagado, rotar tokens) sale de n8n o de las rutas API
-- del servidor Next usando la clave service_role (que bypassa RLS).

-- ------------------------------------------------------------
-- Carta de ejemplo. Adapta nombres y precios a la carta real del bar.
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
