/** @type {import('tailwindcss').Config} */
const { colors } = require('./src/utils/colors.ts');

export default {
  content: [    "./index.html",
  "./src/**/*.{js,ts,jsx,tsx}",],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Work Sans', 'system-ui', 'Avenir', 'Helvetica', 'Arial', 'sans-serif'],
      },
      colors: {
        primary: colors.primary,
        secondary: colors.secondary,
        primary_text: colors.primaryText,
        background: colors.background,
        faint_text: colors.faintText,
        input_text: colors.inputfieldText,
        danger: colors.danger,
        link_text: colors.linkText
        // Add more color variables as needed
      },
      boxShadow: {
        'custom': '0px 4px 5.5px rgba(0, 97, 243, 0.13);',
      },
      zIndex: {
        '100': '100',
        '80': '80'
      },
      letterSpacing: {
        '-2%': '-0.02em',
      },
    },
  },
  plugins: [
    // require('@tailwindcss/line-clamp'),
  ],
}

