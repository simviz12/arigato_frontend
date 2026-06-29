export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'ari-paper': '#faf9f7',
        'ari-cream': '#f0ede6',
        'ari-ink': '#1a1a1a',
        'ari-ash': '#3d3d3d',
        'ari-mist': '#6b6b6b',
        'ari-line': '#e2ddd6',
        'ari-indigo': '#1a1a2e',
        'ari-vermilion': '#e63946',
        'ari-sidebar': '#16213e',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Outfit', 'sans-serif'],
      },
      animation: {
        'hanko-stamp': 'hankoStamp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
      },
      keyframes: {
        hankoStamp: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(0.85)', backgroundColor: '#c0392b', boxShadow: '0 0 0 4px #fdecea' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}
