import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Deep navy/slate — the "steel plate" base of the palette
        navy: {
          950: "#0A121C",
          900: "#0F1B2D",
          800: "#16263B",
          700: "#1E2F47",
          600: "#2A3F5A",
        },
        // Industrial safety orange — the accent, used sparingly
        signal: {
          600: "#C24A0A",
          500: "#E8590C",
          400: "#FF7A29",
          300: "#FFA35F",
        },
        // Muted steel grays for text/lines
        steel: {
          50: "#F5F6F8",
          100: "#EBEDF1",
          300: "#C3C9D1",
          500: "#6B7480",
          700: "#3F4750",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      backgroundImage: {
        "diagonal-lines":
          "repeating-linear-gradient(115deg, rgba(255,255,255,0.035) 0px, rgba(255,255,255,0.035) 1px, transparent 1px, transparent 14px)",
      },
    },
  },
  plugins: [],
};

export default config;
