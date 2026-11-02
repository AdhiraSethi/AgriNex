/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        agri: {
          50: '#f0fdf5',
          100: '#d8f3dc',
          200: '#b7e4c7',
          300: '#95d5b2',
          400: '#74c69d',
          500: '#52b788',
          600: '#40916c',
          700: '#2d6a4f',
          800: '#1b4332',
          900: '#081c15',
        },
        forest: {
          light: '#d8f3dc',
          medium: '#52b788',
          dark: '#2d6a4f',
          deeper: '#1b4332',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-agri': 'linear-gradient(135deg, #2d6a4f 0%, #40916c 50%, #52b788 100%)',
        'gradient-hero': 'linear-gradient(135deg, #081c15 0%, #1b4332 40%, #2d6a4f 100%)',
        'gradient-card': 'linear-gradient(135deg, rgba(45,106,79,0.1) 0%, rgba(64,145,108,0.05) 100%)',
      },
      boxShadow: {
        'agri': '0 4px 14px 0 rgba(45, 106, 79, 0.25)',
        'agri-lg': '0 8px 30px rgba(45, 106, 79, 0.3)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
    },
  },
  plugins: [],
}
