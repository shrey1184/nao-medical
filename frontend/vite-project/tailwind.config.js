/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        neu: {
          bg: '#e0e5ec',
          light: '#ffffff',
          dark: '#a3b1c6',
          accent: '#4a90e2',
          success: '#27ae60',
          danger: '#e74c3c',
        }
      },
      boxShadow: {
        'neu': '8px 8px 16px #a3b1c6, -8px -8px 16px #ffffff',
        'neu-sm': '4px 4px 8px #a3b1c6, -4px -4px 8px #ffffff',
        'neu-inset': 'inset 4px 4px 8px #a3b1c6, inset -4px -4px 8px #ffffff',
        'neu-hover': '12px 12px 24px #a3b1c6, -12px -12px 24px #ffffff',
      },
    },
  },
  plugins: [],
}
