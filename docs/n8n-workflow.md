# n8n · Workflow de validación de pedidos

Este documento describe la lógica del workflow de n8n que actúa como middleware
de confianza entre el frontend y Supabase/Stripe.

## Disparador
`Webhook` → `POST /pedidos-nuevo` (URL: `N8N_WEBHOOK_URL`)

## Entrada esperada (desde el frontend)
```json
{
  "mesa": 3,
  "token": "base64url(token_firmado)",
  "items": [{"id": "cappuccino", "qty": 2}],
  "tipo": "mesa",
  "cliente_nombre": "...",
  "cliente_telefono": "...",
  "direccion": "..."
}
```

## Nodos del workflow (en orden)

### 1. Webhook (entrada)
Recibe el payload del frontend.

### 2. Validar tipo y mesas
- Si `tipo === "mesa"`: `mesa` debe estar entre 1 y 8.
- Si `tipo === "domicilio"`: `cliente_nombre`, `cliente_telefono`, `direccion` obligatorios.

### 3. Validar token de la mesa (solo tipo mesa)
- Leer `mesas.token_actual` y `mesas.token_expira_at` de Supabase (service_role).
- Decodificar el token (base64url) → `{ mesa, exp, sig }`.
- Recomputar HMAC-SHA256 con `QR_SECRET` sobre `<payloadStr>.<signature>` y comparar con `sig`.
- Rechazar si:
  - `token` no coincide con el `token_actual` de la mesa (QR compartido / viejo).
  - `exp < ahora` (token expirado, > 1 día).
  - La mesa del token no coincide con `mesa`.

### 4. Límite de horario (crítico)
- Obtener hora actual de la cafetería (zona horaria local, ej. Europe/Madrid).
- Horario de apertura: `APERTURA_HORA:APERTURA_MINUTO` (ej. 08:00).
- Cierre: `CIERRE_HORA:CIERRE_MINUTO` (ej. 20:00).
- Rechazar si:
  - Ahora < apertura o ahora > cierre → "Fuera de horario de apertura".
  - Ahora > cierre - 15 minutos → "No se aceptan pedidos en los últimos 15 minutos antes del cierre".

### 5. Recalcular precios (crítico - fuente de verdad)
Para cada ítem del frontend (`{id, qty}`):
- Consultar `productos` WHERE `id = it.id` AND `disponible = true`.
- Si no existe o no está disponible → rechazar con `"Producto no disponible: <id>"`.
- `unit_cents = precio * 100` (precio unitario de BD).
- `subtotal_cents = unit_cents * qty`.
- `total_cents = suma(subtotal_cents)`.

### 6. Comparar con el total enviado (opcional, defensa extra)
Si el frontend enviara `total` (no debería), comparar contra `total_cents` recalculado.
Si no coinciden → rechazar con `"Precio manipulado"`.

### 7. Crear pedido en Supabase (service_role)
INSERT en `pedidos`:
- `mesa_id`, `tipo`, `total = total_cents / 100`
- `items = jsonb` con líneas enriquecidas:
  `[{"id","nombre","unit": precio,"qty","subtotal": subtotal_cents/100}]`
- `estado = 'pendiente_confirmacion'`
- `cliente_nombre`, `cliente_telefono`, `direccion` (si domicilio)
- `created_at = now()`

### 8. Responder al frontend
```json
{
  "ok": true,
  "pedido_id": "<uuid>",
  "items": [{"id","nombre","unit_cents","qty","subtotal_cents"}],
  "total_cents": 1250
}
```

En caso de rechazo en cualquier nodo anterior:
```json
{
  "ok": false,
  "motivo": "Mensaje claro para el cliente (ej. 'Fuera de horario')"
}
```

### 9. Panel de administración (separado)
El personal abre `/admin` (Next.js) y lista pedidos con `estado = 'pendiente_confirmacion'`.
Al pulsar "Confirmar", se actualiza `estado = 'pagado'` (tras confirmar el pago de Stripe
mediante webhook de Stripe) o `estado = 'preparando'` y se envía a cocina.

## Notas de seguridad
- La clave `QR_SECRET` y `SUPABASE_SERVICE_ROLE_KEY` solo viven en n8n (variables de entorno), nunca en el frontend.
- El frontend NUNCA envía precios ni totales. Cualquier intento de manipularlos es detectado en el paso 5/6.
- Los tokens de QR se rotan cada 24h (script `scripts/generar-qr.js`).
