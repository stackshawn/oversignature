// Property of Zafrid - OverSignature. Closed Source. Copyright © 2024-2025. Unauthorized distribution prohibited.
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        aeon: {
          dark: '#0f0f13',
          cyan: '#00f2ea',
          purple: '#6200ea',
        }
      }
    },
  },
  plugins: [],
}
