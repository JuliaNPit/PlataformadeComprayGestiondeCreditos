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
          blue: '#1F4E79',
          yellow: '#FFC300',
          light: '#2E75B6',
        }
      }
    },
  },
  plugins: [],
}