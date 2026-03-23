/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          light: '#ccfbf1', // teal-50
          DEFAULT: '#0d9488', // teal-600
          dark: '#0f766e', // teal-700
        },
        surface: '#ffffff',
        background: '#f8fafc',
        alert: '#f43f5e',
      }
    },
  },
  plugins: [],
}