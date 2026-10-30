/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#101B35',
          blue: '#356AE6',
          'blue-light': '#EAF1FF',
          bg: '#F7F8FC',
          text: '#172033',
          muted: '#78839A',
          border: '#E5E9F2',
        },
        status: {
          pending: '#F59E0B',
          seen: '#3B82F6',
          queued: '#8B5CF6',
          answered: '#14B8A6',
          resolved: '#10B981',
          escalated: '#EF4444',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
