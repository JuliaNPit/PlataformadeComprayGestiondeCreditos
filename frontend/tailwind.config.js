/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        uptc: {
          amarillo: '#C8A400',
          'amarillo-claro': '#F5D700',
          'amarillo-hover': '#A88A00',
          negro: '#1A1A1A',
          'gris-oscuro': '#2C2C2C',
          'gris-medio': '#5C5C5C',
          'gris-claro': '#F5F4EF',
        }
      }
    },
  },
  plugins: [],
}