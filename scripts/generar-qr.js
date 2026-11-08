/**
 * scripts/generar-qr.js
 *
 * Genera los 8 códigos QR de Las Mesas Café Bar.
 *
 * Cada QR apunta a: https://tu-dominio.com/mesa/[id]?token=<HMAC>
 * El token se firma con HMAC-SHA256 usando una clave secreta y expira a las 24h.
 *
 * Uso:
 *   cp .env.example .env.local   # rellena QR_SECRET y NEXT_PUBLIC_APP_URL
 *   npm run qr:generate
 *
 * Salida: qr/mesa-1.png ... qr/mesa-8.png  +  qr/tokens.json (para importar en Supabase)
 */

import QRCode from "qrcode";
import crypto from "crypto";
import fs from "fs";
import path from "path";

const SECRET = process.env.QR_SECRET;
if (!SECRET) {
  console.error("Falta QR_SECRET en el entorno. Crea .env.local con QR_SECRET=...");
  process.exit(1);
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const NUM_MESAS = 8;
const EXPIRA_HORAS = 24;

const outDir = path.join(process.cwd(), "qr");
fs.mkdirSync(outDir, { recursive: true });

const expiraAt = new Date(Date.now() + EXPIRA_HORAS * 60 * 60 * 1000);

const tokens = [];

for (let id = 1; id <= NUM_MESAS; id++) {
  // Payload del token: mesa + expiración. Firmado con HMAC.
  const payload = { mesa: id, exp: expiraAt.getTime() };
  const payloadStr = JSON.stringify(payload);
  const signature = crypto.createHmac("sha256", SECRET).update(payloadStr).digest("hex");

  const token = Buffer.from(`${payloadStr}.${signature}`).toString("base64url");

  const url = `${APP_URL}/mesa/${id}?token=${encodeURIComponent(token)}`;

  const fileName = `mesa-${id}.png`;
  const filePath = path.join(outDir, fileName);

  await QRCode.toFile(filePath, url, {
    width: 600,
    margin: 2,
    color: {
      dark: "#0b0c10", // negro del logo
      light: "#FFF", // fondo blanco
    },
  });

  tokens.push({
    mesa: id,
    token,
    url,
    archivo: fileName,
    expira_at: expiraAt.toISOString(),
  });

  console.log(`✓ Mesa ${id}: ${filePath}`);
}

fs.writeFileSync(
  path.join(outDir, "tokens.json"),
  JSON.stringify(tokens, null, 2)
);

console.log(`\nListo: ${NUM_MESAS} QR generados en ${outDir}/`);
console.log("Importa los tokens en Supabase:");
console.log("  UPDATE mesas SET token_actual = '...', token_expira_at = '...' WHERE id = N;");
