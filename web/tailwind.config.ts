import type { Config } from 'tailwindcss';
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#64ffda',
          dark: '#0a0e27',
          navy: '#0d1b4b',
          teal: '#00897b',
        },
        risk: {
          critical: '#f85149',
          high: '#e3b341',
          medium: '#d29922',
          low: '#3fb950',
        },
      },
      fontFamily: { sans: ['Inter', 'sans-serif'] },
      animation: {
        'ticker': 'ticker 30s linear infinite',
        'pulse-dot': 'pulse-dot 1.5s infinite',
        'count-up': 'count-up 2s ease-out forwards',
      },
      keyframes: {
        ticker: { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
        'pulse-dot': { '0%,100%': { boxShadow: '0 0 0 0 rgba(76,175,80,0)' }, '70%': { boxShadow: '0 0 0 7px rgba(76,175,80,0)' } },
      },
    },
  },
  plugins: [],
};
export default config;
