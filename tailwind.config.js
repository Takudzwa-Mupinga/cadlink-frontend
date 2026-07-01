/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        cad: {
          dark:    'rgb(var(--cad-dark)    / <alpha-value>)',
          panel:   'rgb(var(--cad-panel)   / <alpha-value>)',
          surface: 'rgb(var(--cad-surface) / <alpha-value>)',
          accent:  'rgb(var(--cad-accent)  / <alpha-value>)',
          success: 'rgb(var(--cad-success) / <alpha-value>)',
          text:    'rgb(var(--cad-text)    / <alpha-value>)',
          muted:   'rgb(var(--cad-muted)   / <alpha-value>)',
          border:  'var(--cad-border)',
        }
      },
      boxShadow: {
        'glow': '0 0 20px -5px rgba(139, 92, 246, 0.15)',
        'glow-accent': '0 0 15px rgba(139, 92, 246, 0.3)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
        'premium': '0 20px 40px -10px rgba(0, 0, 0, 0.5)'
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'blob': 'blob 10s infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' }
        }
      }
    },
  },
  plugins: [],
}