/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        master: '#0f1011',
        sidebar: '#161719',
        card: '#1c1d1f',
        heading: '#e2e8f0',
        signal: '#22c55e',
        activity: '#121315',
        subtle: '#27282b'
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif']
      }
    },
  },
  plugins: [],
}
