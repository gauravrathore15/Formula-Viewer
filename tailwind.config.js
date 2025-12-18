/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./App.tsx",
    "./components/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
    "./services/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1e1b4b",
        "primary-accent": "#4338ca",
        "background-light": "#f3f4f6",
        "background-dark": "#111827",
        "surface-light": "#ffffff",
        "surface-dark": "#1f2937",
        "border-light": "#e5e7eb",
        "border-dark": "#374151",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        soft: "0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)",
      },
    },
  },
  variants: {
    scrollbar: ["rounded", "dark"],
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('tailwind-scrollbar'),
  ],
};
