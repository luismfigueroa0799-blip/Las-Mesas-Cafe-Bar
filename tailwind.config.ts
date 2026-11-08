import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        negro: "#0a0a0a",
        "negro-suave": "#111111",
        "negro-card": "#141414",
        "negro-borde": "#1f1f1f",
        dorado: "#d4aa58",
        "dorado-claro": "#e3c77f",
        "dorado-oscuro": "#8a6a1f",
        blanco: "#ffffff",
        "blanco-suave": "#f3f4f6",
        texto: "#e5e7eb",
        "texto-secundario": "#9ca3af",
        borde: "#2a2a2a",
      },
      fontFamily: {
        serif: ["Georgia", "Times New Roman", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "1.875rem",
        full: "9999px",
      },
      boxShadow: {
        dorado: "0 0 20px rgba(212, 170, 88, 0.15)",
        "dorado-hover": "0 0 30px rgba(212, 170, 88, 0.25)",
        card: "0 10px 40px rgba(0, 0, 0, 0.5)",
      },
      animation: {
        "pulse-dorado": "pulse-dorado 2s infinite",
        "fade-in": "fade-in 0.6s ease-out",
        "slide-up": "slide-up 0.5s ease-out",
        "slide-in-right": "slide-in-right 0.4s ease-out",
      },
      keyframes: {
        "pulse-dorado": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(212, 170, 88, 0.15)" },
          "50%": { boxShadow: "0 0 35px rgba(212, 170, 88, 0.35)" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
