/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'high-risk': '#ef4444',
        'medium-risk': '#f59e0b',
        'low-risk': '#10b981',
        'operational': '#10b981',
        'non-operational': '#ef4444'
      }
    },
  },
  plugins: [],
}
