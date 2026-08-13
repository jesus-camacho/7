/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Warm, near-black "Obsidian" surface scale (0 = page, higher = more elevated).
        surface: {
          0: "#18181b",
          100: "#1f1f24",
          200: "#28282e",
          300: "#38383f",
        },
        ink: {
          900: "#eeece7",
          700: "#c7c5c0",
          500: "#96948d",
          400: "#6f6d68",
        },
        gold: {
          100: "rgba(242, 179, 68, 0.14)",
          400: "#f2b344",
          500: "#eaa52e",
          600: "#c98a1e",
        },
        violet: {
          100: "rgba(157, 124, 245, 0.16)",
          400: "#a98ef7",
          500: "#8f6ff2",
          600: "#7a56e8",
        },
        teal: {
          100: "rgba(45, 212, 191, 0.16)",
          400: "#5eead4",
          500: "#2dd4bf",
          600: "#14b8a6",
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
        display: [
          "Manrope",
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
      },
      letterSpacing: {
        widest2: "0.14em",
      },
      boxShadow: {
        panel: "-16px 0 40px -16px rgba(0, 0, 0, 0.5)",
        float: "0 8px 30px -6px rgba(0, 0, 0, 0.45)",
        card: "0 1px 2px rgba(0, 0, 0, 0.25)",
      },
    },
  },
  plugins: [],
};
