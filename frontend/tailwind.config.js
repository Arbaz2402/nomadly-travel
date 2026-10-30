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
        // Midnight Navy / Deep Ink foundation
        ink: {
          950: '#070b14',
          900: '#0d1322',
          850: '#11182c',
          800: '#162039',
          700: '#223053',
          600: '#344570',
        },
        // Electric Coral / Vivid Orange brand action
        coral: {
          50: '#fff3f0',
          100: '#ffe5de',
          200: '#ffcfc2',
          300: '#ffa894',
          400: '#ff7759',
          500: '#ff5a36',
          600: '#f03e18',
          700: '#c82e0e',
        },
        // Warm Ivory surface tones
        ivory: {
          50: '#fdfbf7',
          100: '#f9f6ef',
          200: '#f2ece0',
          300: '#e5dcce',
          400: '#d1c4b0',
        },
        // Teal accents for availability & confirmation
        teal: {
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 0 25px -5px rgba(255, 90, 54, 0.25)',
        'glow-teal': '0 0 25px -5px rgba(20, 184, 166, 0.25)',
        'card': '0 10px 30px -10px rgba(7, 11, 20, 0.08)',
        'card-dark': '0 10px 30px -10px rgba(0, 0, 0, 0.5)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
    },
  },
  plugins: [],
}
