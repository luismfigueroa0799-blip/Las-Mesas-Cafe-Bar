# Las Mesas Café Bar · Sistema de pedidos (mesa + domicilio)

Stack: Next.js 14 (App Router) + Tailwind CSS · Supabase (Postgres) · Stripe Checkout · n8n (middleware de validación).

## Estructura

```
supabase/schema.sql      → Tablas productos, mesas, pedidos, webhook_events (RLS)
src/lib/types.ts         → Tipos TypeScript compartidos
src/lib/supabase.ts      → Cliente Supabase (anon + service_role)
src/lib/stripe.ts        → Cliente Stripe
src/app/page.tsx         → Landing
src/app/mesa/[id]/page.tsx → Página de mesa (QR)
src/app/domicilio/page.tsx → Página para llevar
src/app/pedido-exitoso/page.tsx → Después del pago
src/app/admin/page.tsx → Panel de administración (personal)
src/app/api/pedidos/route.ts → Reenvía a n8n (frontend nunca envía precios)
src/app/api/stripe-checkout/route.ts → Crea sesión Stripe
src/app/api/webhooks/stripe/route.ts → Webhook de Stripe (idempotente, marca pagado)
src/app/api/admin/pedidos/route.ts → Lista pedidos (admin)
src/app/api/admin/pedidos/[id]/confirmar/route.ts → Confirma pedido (admin)
src/app/api/admin/pedidos/[id]/rechazar/route.ts → Rechaza + reembolsa (admin)
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
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave pública/anónima (lectura carta + canales tiempo real) |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave de servicio (servidor, bypassa RLS) |
| `STRIPE_SECRET_KEY` | Clave secreta de Stripe |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Clave publicable de Stripe |
| `STRIPE_WEBHOOK_SECRET` | Secreto del webhook de Stripe |
| `N8N_WEBHOOK_URL` | Webhook de n8n que valida pedidos |
| `NEXT_PUBLIC_APP_URL` | URL base de la app |
| `ADMIN_TOKEN` | Token para proteger `/admin` (usar en rutas API) |
| `NEXT_PUBLIC_ADMIN_TOKEN` | Mismo token (usado en frontend para saber si panel activo) |
| `APERTURA_HORA/MINUTO`, `CIERRE_HORA/MINUTO`, `CIERRE_RESTRINGIDO_MINUTOS` | Horario de apertura |

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

## Stripe Webhook (crítico)

Configurar en **Stripe Dashboard → Developers → Webhooks**:

- Endpoint: `https://tu-dominio.com/api/webhooks/stripe`
- Eventos: `checkout.session.completed`, `charge.refunded`
- Secreto: `STRIPE_WEBHOOK_SECRET`

Para probar en local:

```bash
# Instalar Stripe CLI
stripe listen --forward-to localhost:3000/api/webhooks/stripe
# Copiar el whsec_... que imprime a .env.local como STRIPE_WEBHOOK_SECRET
```

## Panel de administración

URL: `/admin`

Protegido con `ADMIN_TOKEN`. Permite al personal:
- Ver pedidos pendientes de confirmar (tiempo real con Supabase)
- Confirmar pedido → pasa a "En cocina"
- Marcar como listo para servir
- Rechazar y reembolsar (usa Stripe refunds automáticamente)

## Flujo de estados del pedido

```
pendiente_pago     → cliente creó checkout, aún no pagó
pendiente_confirmacion → Stripe notificó pago, espera personal
pagado             → personal verificó (últimos pagados)
preparando         → en cocina (botón Confirmar)
listo              → listo para servir (botón Listo)
entregado          → servido al cliente
rechazado_reembolsado → rechazado + dinero devuelto (botón Rechazar)
cancelado          → nunca pagó (timeout n8n)
```

## Despliegue

Conectar el repo a Vercel. Configurar todas las variables de entorno.
Importante: desplegar desde la rama `sistema-pedidos-nextjs` para no mezclar
con el sitio estático en `main`.

## Seguridad (resumen)

- El frontend **nunca envía precios ni totales**. Solo `{mesa, items:[{id,qty}]}`.
- n8n recalcula el total contra `productos.precio × qty` y rechaza si no cuadra.
- Cada QR lleva un token HMAC firmado válido 24h; n8n lo valida antes de aceptar.
- Los pedidos nacen en `pendiente_confirmacion`: el personal debe confirmar en `/admin`.
- n8n rechaza pedidos fuera de horario o en los últimos 15 minutos antes del cierre.
- Webhook de Stripe es idempotente (tabla `webhook_events`) y siempre responde 200.
