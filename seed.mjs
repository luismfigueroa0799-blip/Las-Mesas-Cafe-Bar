// Script de seed para importar la carta completa a Supabase
// Ejecuta: node seed.mjs

import { createClient } from '@supabase/supabase-js';

// Cargar variables de entorno manualmente o usar las del .env
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tu-proyecto.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'tu_service_role_key';

if (supabaseUrl === 'https://tu-proyecto.supabase.co' || !supabaseServiceKey) {
  console.error('❌ Configura tus variables de entorno SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Productos de la carta de Las Mesas Café Bar
const productos = [
  { nombre: "Lágrimas de pollo crispy", precio: 7.50, categoria: "Entrantes", disponible: true },
  { nombre: "Fingers de pollo (6 uds)", precio: 9.00, categoria: "Entrantes", disponible: true },
  { nombre: "Alitas de pollo al chipotle", precio: 6.50, categoria: "Entrantes", disponible: true },
  { nombre: "Nuggets de pollo premium (10 uds)", precio: 7.00, categoria: "Entrantes", disponible: true },
  { nombre: "Brochetas de pollo (3 uds)", precio: 6.00, categoria: "Entrantes", disponible: true },
  { nombre: "Croquetas de pollo o atún (8 uds)", precio: 6.50, categoria: "Entrantes", disponible: true },
  
  { nombre: "La suprema (Hamburguesa)", precio: 8.50, categoria: "Hamburguesas", disponible: true },
  { nombre: "La tradicional (Hamburguesa)", precio: 7.50, categoria: "Hamburguesas", disponible: true },
  { nombre: "Burger Pizza", precio: 9.00, categoria: "Hamburguesas", disponible: true },
  { nombre: "La súper (Pollo)", precio: 8.00, categoria: "Hamburguesas", disponible: true },
  { nombre: "La simple (Pollo)", precio: 7.00, categoria: "Hamburguesas", disponible: true },
  
  { nombre: "Perrito súper", precio: 4.50, categoria: "Perritos", disponible: true },
  { nombre: "Perrito normal", precio: 3.50, categoria: "Perritos", disponible: true },
  
  { nombre: "Pan de ajo normal", precio: 3.00, categoria: "Pizzas", disponible: true },
  { nombre: "Pan de ajo con queso", precio: 3.50, categoria: "Pizzas", disponible: true },
  { nombre: "La bella serrana (Pizza)", precio: 9.50, categoria: "Pizzas", disponible: true },
  { nombre: "La tradicional (Pizza)", precio: 8.50, categoria: "Pizzas", disponible: true },
  { nombre: "La parrillera (Pizza)", precio: 10.50, categoria: "Pizzas", disponible: true },
  { nombre: "La delicia (Pizza)", precio: 9.50, categoria: "Pizzas", disponible: true },
  
  { nombre: "El ternera crack (Bocadillo)", precio: 6.50, categoria: "Bocadillos", disponible: true },
  { nombre: "El ternera simple (Bocadillo)", precio: 5.50, categoria: "Bocadillos", disponible: true },
  { nombre: "El lomo goloso (Bocadillo)", precio: 6.50, categoria: "Bocadillos", disponible: true },
  { nombre: "El pollo simple (Bocadillo)", precio: 5.50, categoria: "Bocadillos", disponible: true },
  
  { nombre: "Cono de papas", precio: 3.50, categoria: "Papas", disponible: true },
  { nombre: "Papas Pequeñas", precio: 3.00, categoria: "Papas", disponible: true },
  { nombre: "Papas Grandes", precio: 5.00, categoria: "Papas", disponible: true },

  { nombre: "Café", precio: 1.00, categoria: "Cafés", disponible: true },
  { nombre: "Cortado corto", precio: 1.10, categoria: "Cafés", disponible: true },
  { nombre: "Cortado largo", precio: 1.20, categoria: "Cafés", disponible: true },
  { nombre: "Leche y leche corto", precio: 1.30, categoria: "Cafés", disponible: true },
  { nombre: "Café con leche", precio: 1.40, categoria: "Cafés", disponible: true },
  { nombre: "Chocolate", precio: 1.50, categoria: "Cafés", disponible: true },
  { nombre: "Infusiones", precio: 1.20, categoria: "Cafés", disponible: true },

  { nombre: "Coca-Cola", precio: 2.00, categoria: "Refrescos", disponible: true },
  { nombre: "Sprite", precio: 1.50, categoria: "Refrescos", disponible: true },
  { nombre: "Fanta Limón", precio: 1.50, categoria: "Refrescos", disponible: true },
  { nombre: "Fanta Naranja", precio: 1.50, categoria: "Refrescos", disponible: true },
  { nombre: "Tónica", precio: 1.50, categoria: "Refrescos", disponible: true },
  { nombre: "Agua pequeña", precio: 1.50, categoria: "Refrescos", disponible: true },
  { nombre: "Agua grande", precio: 2.00, categoria: "Refrescos", disponible: true },
  { nombre: "Zumo Naranja", precio: 3.20, categoria: "Refrescos", disponible: true },
  { nombre: "Red Bull", precio: 2.40, categoria: "Refrescos", disponible: true },

  { nombre: "Estrella mini", precio: 1.00, categoria: "Cervezas", disponible: true },
  { "nombre": "1906", "precio": 2.90, "categoria": "Cervezas", "disponible": true },
  { "nombre": "Corona", "precio": 3.00, "categoria": "Cervezas", "disponible": true },
  { "nombre": "Tropical", "precio": 1.40, "categoria": "Cervezas", "disponible": true },
  { "nombre": "Dorada normal", "precio": 1.80, "categoria": "Cervezas", "disponible": true },
  { "nombre": "Dorada especial", "precio": 1.80, "categoria": "Cervezas", "disponible": true },
  { "nombre": "Estrella", "precio": 1.30, "categoria": "Cervezas", "disponible": true }
];

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

async function main() {
  console.log('🌱 Iniciando seed de productos a Supabase...\n');

  const { error } = await supabase
    .from('productos')
    .insert(productos);

  if (error) {
    console.error('❌ Error al insertar productos:', error.message);
    console.error('Detalles:', error);
    process.exit(1);
  }

  console.log(`✅ ¡Éxito! Se insertaron ${productos.length} productos en la tabla 'productos'.`);
  console.log('🌿 La carta de Las Mesas Café Bar ya está disponible en tu base de datos.\n');
  console.log('📊 Resumen por categoría:');
  
  // Contar por categoría
  const categorias = {};
  productos.forEach(p => {
    categorias[p.categoria] = (categorias[p.categoria] || 0) + 1;
  });
  Object.entries(categorias).forEach(([cat, cant]) => {
    console.log(`   - ${cat}: ${cant} productos`);
  });
}

main().catch(err => {
  console.error('❌ Error inesperado:', err);
  process.exit(1);
});