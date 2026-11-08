import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        petroleo: "#15120e",
        "petroleo-oscuro": "#0b0a08",
        dorado: "#d4aa58",
        "dorado-claro": "#e3c77f",
        "dorado-oscuro": "#8a6a1f",
        crema: "#f6efe0",
        negro: "#15120e",
      },
      fontFamily: {
        serif: ["Georgia", "Times New Roman", "serif"],
        sans: ["Arial", "Helvetica", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
