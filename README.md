# Las Mesas Café Bar · Sistema de pedidos (mesa + domicilio)

Stack: Next.js 14 (App Router) + Tailwind CSS · Supabase (Postgres) · Stripe Checkout · n8n (middleware de validación).

## Estructura

```
supabase/schema.sql      → Tablas productos, mesas, pedidos (RLS)
src/lib/types.ts         → Tipos TypeScript compartidos
src/lib/supabase.ts      → Cliente Supabase (anon + service_role)
src/lib/stripe.ts        → Cliente Stripe
src/app/page.tsx         → Landing
src/app/mesa/[id]/page.tsx → Página de mesa (QR)
src/app/domicilio/page.tsx → Página para llevar
src/app/pedido-exitoso/page.tsx → Después del pago
src/app/api/pedidos/route.ts → Reenvía a n8n
src/app/api/stripe-checkout/route.ts → Crea sesión Stripe
scripts/generar-qr.js    → Genera 8 QRs con token HMAC
docs/n8n-workflow.md     → Lógica del workflow n8n
```

## Instalación

```bash
cd las-mesas-pedidos
npm install
cp .env.example .env.local   # edita con tus claves
npm run dev                  # http://localhost:3000
```

## Variables de entorno (`.env.local`)

| Variable | Descripción |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave pública/anónima (solo lectura de carta) |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave de servicio (servidor, bypassa RLS) |
| `STRIPE_SECRET_KEY` | Clave secreta de Stripe |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Clave publicable de Stripe |
| `STRIPE_WEBHOOK_SECRET` | Secreto del webhook de Stripe |
| `N8N_WEBHOOK_URL` | Webhook de n8n que valida pedidos |
| `NEXT_PUBLIC_APP_URL` | URL base de la app |
| `APERTURA_HORA/MINUTO`, `CIERRE_HORA/MINUTO`, `CIERRE_RESTRINGIDO_MINUTOS` | Horario de apertura |
| `QR_SECRET` | Secreto para firmar tokens de QR (solo generador y n8n) |

## Base de datos

Ejecutar `supabase/schema.sql` en el SQL Editor de Supabase. Crea las tablas,
inserta 8 mesas y una carta de ejemplo.

## Generar los QR de las mesas

```bash
cp .env.example .env.local
# Añadir QR_SECRET=clave_aleatoria
npm run qr:generate
```

Esto crea `qr/mesa-1.png … qr/mesa-8.png` y `qr/tokens.json`. Imprimir los PNG y
pegar en cada mesa. Importar los tokens en Supabase:

```sql
UPDATE mesas SET token_actual = '...', token_expira_at = '...' WHERE id = 1;
```

## n8n

Importar la lógica de `docs/n8n-workflow.md` como workflow. El endpoint webhook
debe exponerse como `N8N_WEBHOOK_URL`.

## Despliegue

Conectar el repo a Vercel (o similar). Configurar todas las variables de entorno.
El sitio es estático salvo las rutas API (`/api/*`) que son serverless.

## Seguridad (resumen)

- El frontend **nunca envía precios ni totales**. Solo `{mesa, items:[{id,qty}]}`.
- n8n recalcula el total contra `productos.precio × qty` y rechaza si no cuadra.
- Cada QR lleva un token HMAC firmado válido 24h; n8n lo valida antes de aceptar.
- Los pedidos nacen en `pendiente_confirmacion`: el personal debe confirmar en el panel de admin antes de enviarlos a cocina.
- n8n rechaza pedidos fuera de horario o en los últimos 15 minutos antes del cierre.
