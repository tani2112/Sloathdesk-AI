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
        sloth: {
          bg: '#08080a',
          card: '#111115',
          surface: '#17171d',
          border: '#25252e',
          borderGlow: '#facc15',
          muted: '#8e8e99',
          yellow: '#facc15',
          yellowLight: '#fde047',
          gold: '#eab308',
          amber: '#f59e0b',
          amberDark: '#b45309',
          emerald: '#10b981',
          rose: '#f43f5e',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'yellow-glow': '0 0 25px -4px rgba(250, 204, 21, 0.25)',
        'yellow-lg': '0 10px 30px -5px rgba(250, 204, 21, 0.3)',
      },
      animation: {
        'sloth-float': 'slothFloat 4s ease-in-out infinite',
        'sloth-breathe': 'slothBreathe 3s ease-in-out infinite',
        'pulse-subtle': 'pulseSubtle 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        slothFloat: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        slothBreathe: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.02)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        }
      }
    },
  },
  plugins: [],
}
