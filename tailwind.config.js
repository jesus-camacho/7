/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        base: {
          950: "#0a0b0f",
          900: "#0f1117",
          850: "#12141c",
          800: "#171a24",
          700: "#232634",
          600: "#31354a",
        },
        gold: {
          400: "#f5c15b",
          500: "#eab040",
          600: "#c98d24",
        },
        azure: {
          400: "#5b9df5",
          500: "#3b82f6",
          600: "#2563eb",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "sans-serif",
        ],
      },
      boxShadow: {
        glow: "0 0 40px -8px rgba(234, 176, 64, 0.35)",
        panel: "-8px 0 30px -12px rgba(0, 0, 0, 0.6)",
      },
    },
  },
  plugins: [],
};
