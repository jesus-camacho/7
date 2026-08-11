/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Light, paper-toned surface scale (0 = white, higher = deeper).
        paper: {
          0: "#ffffff",
          50: "#f6f7fa",
          100: "#eef1f6",
          200: "#e2e6ee",
          300: "#ccd2de",
        },
        // Neutral ink scale for text.
        ink: {
          900: "#161c28",
          700: "#333c4d",
          500: "#5c6779",
          400: "#8892a3",
        },
        gold: {
          100: "#fbedd2",
          400: "#e0a723",
          500: "#c8901a",
          600: "#a06f10",
        },
        blue: {
          100: "#e2eaff",
          400: "#4c78e6",
          500: "#3660d1",
          600: "#2748a8",
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
        panel: "-12px 0 32px -14px rgba(22, 28, 40, 0.25)",
        card: "0 1px 2px rgba(22, 28, 40, 0.06), 0 1px 1px rgba(22, 28, 40, 0.04)",
      },
    },
  },
  plugins: [],
};
