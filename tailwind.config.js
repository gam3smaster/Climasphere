/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        // Used for headings and display text
        display: ['Inter', 'system-ui', 'sans-serif'],
        // Used for numbers, data, and code
        data: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
