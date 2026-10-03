/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        paper: {
          50: '#fbfbfa',
          100: '#f7f6f2',
          200: '#eeebe2',
          300: '#ded9cc',
          400: '#c5beaE',
        },
        ink: {
          950: '#0c0c0b',
          900: '#191816',
          800: '#2c2a27',
          700: '#46433e',
          600: '#646059',
          500: '#848077',
          400: '#a5a198',
          300: '#c7c4bd',
          200: '#e5e3de',
          100: '#f2f1ee',
        },
        accent: {
          DEFAULT: '#c2410c', // Warm artisanal terracotta
          hover: '#9a3412',
          light: '#fff7ed',
          border: '#fdba74',
        },
        primary: {
          50: '#fbfbfa',
          100: '#f5f3ec',
          200: '#e8e5dc',
          300: '#d5d0c3',
          400: '#a5a198',
          500: '#191816',
          600: '#141413',
          700: '#0c0c0b',
          800: '#1e1b4b',
          900: '#0f172a',
          950: '#020617',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['var(--font-serif)', 'Lora', 'Charter', 'Georgia', 'serif'],
        display: ['var(--font-serif)', 'Lora', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};
