import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatoMoneda(cents: number, idioma = "es-ES") {
  return new Intl.NumberFormat(idioma, {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

export function eurDesdeNumero(valor: number | string) {
  return Number(valor).toFixed(2);
}
