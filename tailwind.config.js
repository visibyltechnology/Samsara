export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      colors: {
        primary: '#16a34a',
        'primary-hover': '#15803d',
        accent: '#facc15',
        'accent-hover': '#eab308'
      }
    },
  },
  plugins: [],
}
