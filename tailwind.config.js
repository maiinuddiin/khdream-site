/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./index.tsx",
    "./App.tsx",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./context/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--primary-color)',
          foreground: '#000000',
        },
        secondary: {
          DEFAULT: 'var(--secondary-color)',
          foreground: '#ffffff',
        },
        accent: {
          DEFAULT: 'var(--accent-color)',
          foreground: '#000000',
        },
      },
      fontFamily: {
        sans: ["Montserrat", "Inter", "sans-serif"],
        montserrat: ["Montserrat", "sans-serif"],
        bungee: ["Bungee", "cursive"],
        outfit: ["Outfit", "sans-serif"],
        serif: ["'Cormorant Garamond'", "serif"],
      },
      animation: {
        'shimmer-text': 'shimmer-text 8s linear infinite',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
        'bg-animate': 'bg-animate 15s ease infinite',
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-in-left': 'slide-in-left 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'scroll': 'scroll var(--duration, 30s) linear infinite',
      },
      keyframes: {
        'scroll': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' }
        },
        'shimmer-text': {
          '0%, 100%': { 'background-size': '200% 200%', 'background-position': 'left center' },
          '50%': { 'background-size': '200% 200%', 'background-position': 'right center' },
        },
        'pulse-soft': {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.02)', opacity: '0.9' },
        },
        'bg-animate': {
          '0%, 100%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-in-left': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        }
      }
    },
  },
  plugins: [],
}
