/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  "#f0f6ff",
          100: "#dbe9ff",
          200: "#b6d4ff",
          300: "#84b2ff",
          400: "#4d8dff",
          500: "#2563eb",   // main
          600: "#1d4ed8",
          700: "#1e40af",
          800: "#1e3a8a",
          900: "#1e2f6f",
        },
        secondary: {
          50:  "#f5f3ff",
          100: "#ede9fe",
          200: "#ddd6fe",
          300: "#c4b5fd",
          400: "#a78bfa",
          500: "#8b5cf6",   // main
          600: "#7c3aed",
          700: "#6d28d9",
          800: "#5b21b6",
          900: "#4c1d95",
        }
      }
    },
  },
  plugins: [],
};
