/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    // El App Router de Next.js vive en src/app. Sin esta entrada, Tailwind no
    // escanea las páginas y las clases (text-dorado, bg-negro, text-blanco…)
    // no se generan: los iconos y textos salen sin estilo.
    "./src/app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        negro: "#0a0a0a",
        dorado: "#d4aa58",
        crema: "#f6efe0",
        blanco: "#ffffff",
        "texto-secundario": "#9ca3af",
        borde: "#2a2a2a",
      },
      fontFamily: {
        serif: ["Georgia", "serif"],
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
