# Las Mesas Café Bar: reglas del proyecto (v49)

Responde siempre en español.

## Qué es
Web de una sola página de Las Mesas Café Bar (Pintor Antonio Padrón 59, Las Mesas Bajas, Gran Canaria). Dominio: lasmesasbarcafet.com. Se publica en Cloudflare Pages arrastrando los archivos. No hay build ni frameworks.

## Estructura
- `index.html`: HTML, CSS y los datos de la carta (`const CARTA`) más el código que la pinta.
- `app.js`: reservas, opiniones con fotos, avisos, cookies, Firebase Analytics y carruseles.
- `backend-google-apps-script/Code.gs`: backend en Apps Script (hoja de Google). Se pega en script.google.com; no se publica con la web.
- `imag/`: logo, portada, fotos del local y de los platos en WebP. `sitemap.xml` y `robots.txt` en la raíz.

## La carta
- Cada plato en `CARTA` es `[nombre, descripción, alérgenos, precio]`. Las bebidas y vinos tienen un quinto valor (precio de copa).
- Las fotos de platos se asignan por nombre en la función `fila()` de `index.html`: `FOTOS_EXTRA` (alitas, nuggets, lágrimas, fingers, croquetas, La simple de pollo) y la cadena `visual` para el resto. Para añadir foto: guarda el WebP en `imag/` y añade una entrada.
- Precios y alérgenos deben coincidir con la carta oficial. No cambies precios sin que Luis los confirme. La Burger Pizza figura a 14,80 € en la web; el PDF de carta decía 12,00 €: pendiente de confirmar.

- La carta se muestra por pestañas numeradas en píldora (una sola sección a la vez, sticky bajo el menú). Cada plato es una tarjeta (`fila(plato, info, true)` en `index.html`) con foto cuadrada arriba si la tiene; 2 columnas en móvil, 3 y 4 en pantallas grandes. Las bebidas y vinos van en filas simples (`filaBebida`).

- Pedidos online: carrito y formulario al final de `index.html` (script "Carrito y pago") y configuración en `const PEDIDOS`. El pago se hace con Stripe a través de un Webhook de n8n; el contrato y los pasos están en `docs/pedidos-n8n.md`. `?mesa=N` en la URL = pedido para esa mesa; sin él, para recoger.

## Datos del local
- Llamadas: 928 896 097. WhatsApp para reservas y celebraciones: 601 163 933.
- Instagram: instagram.com/lasmesascafebar. TikTok: tiktok.com/@lasmesascafebar. Glovo y Uber Eats ya enlazados.
- Horario vigente (v45): L–V 18:00–23:00, sáb 12:00–15:00 y 18:00–23:00, dom 12:00–17:00. Si cambia, actualízalo en la portada, en "Contacto", en la franja flotante, en el JSON-LD del `<head>` y en el texto de la meta description.
- Modo Navidad: se activa solo del 20/11/2026 al 07/01/2027 (`?navidad=1` para probarlo, `?navidad=0` para apagarlo).

## Normas de trabajo
- Rendimiento primero (PageSpeed en móvil): imágenes en WebP con `width`, `height` y `loading="lazy"`, salvo la portada.
- Mantén la identidad: negro y dorado del logo, serif Georgia para titulares.
- Probar en iPhone/Safari y Android antes de publicar. Revisa que la web ocupe siempre todo el ancho.
- Pendiente: feed de Instagram (necesita un widget externo) y fotos de las categorías que aún no las tienen.
