/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        stylescript: ['"Style Script"', 'cursive'], // Add the Style Script font here
      },
    },
  },
  plugins: [],
}