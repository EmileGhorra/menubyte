import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#23343C', // dark teal/graphite from logo
        secondary: '#2F4B59', // softened teal for gradients
        accent: '#F59E0B', // warm amber accent for highlights
        dark: '#0F172A',
        light: '#F8FAFC',
      },
      fontFamily: {
        display: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
