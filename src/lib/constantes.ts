export const NUM_MESAS = 8;

export const CATEGORIAS = [
  "cafe",
  "tostadas",
  "bolleria",
  "bocadillos",
  "bebidas",
] as const;

export const ETIQUETAS_CATEGORIA: Record<string, string> = {
  cafe: "Cafe",
  tostadas: "Tostadas",
  bolleria: "Bolleria",
  bocadillos: "Bocadillos",
  bebidas: "Bebidas",
};

export const HORARIO = {
  apertura: { hora: 8, minuto: 0 },
  cierre: { hora: 20, minuto: 0 },
  restringidoMinutos: 15,
};
