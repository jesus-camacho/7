/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        base: {
          950: "#0a0c11",
          900: "#0e1015",
          850: "#12151b",
          800: "#171b23",
          700: "#22262f",
          600: "#2f3440",
        },
        gold: {
          300: "#d4b06a",
          400: "#c39c50",
          500: "#af8740",
          600: "#8f6c30",
        },
        steel: {
          300: "#8fa3c0",
          400: "#6c85a8",
          500: "#526a8c",
          600: "#3f5470",
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
      letterSpacing: {
        widest2: "0.14em",
      },
      boxShadow: {
        panel: "-8px 0 30px -12px rgba(0, 0, 0, 0.6)",
      },
    },
  },
  plugins: [],
};
