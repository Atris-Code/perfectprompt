/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './data/**/*.ts',
    './services/**/*.ts',
    './contexts/**/*.{ts,tsx}',
    './utils/**/*.ts',
    './i18n/**/*.ts',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
