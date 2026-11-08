export const NUM_MESAS = 8;

export const CATEGORIAS = [
  "café",
  "tostadas",
  "bollería",
  "bocadillos",
  "bebidas",
] as const;

export const ETIQUETAS_CATEGORIA: Record<string, string> = {
  café: "Café",
  tostadas: "Tostadas",
  bollería: "Bollería",
  bocadillos: "Bocadillos",
  bebidas: "Bebidas",
};

export const HORARIO = {
  apertura: { hora: 8, minuto: 0 },
  cierre: { hora: 20, minuto: 0 },
  restringidoMinutos: 15,
};
