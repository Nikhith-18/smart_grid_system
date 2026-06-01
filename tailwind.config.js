export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        grid: {
          bg: '#071014',
          panel: '#0d1b20',
          panel2: '#11262d',
          line: '#24424b',
          cyan: '#39d5ff',
          green: '#32d583',
          yellow: '#facc15',
          red: '#fb7185',
          blue: '#60a5fa',
        },
      },
      boxShadow: {
        glow: '0 0 32px rgba(57, 213, 255, 0.2)',
        panel: '0 18px 50px rgba(0, 0, 0, 0.35)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Arial'],
      },
    },
  },
  plugins: [],
};
