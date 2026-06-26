import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy:  '#0a0e27',
          blue:  '#0d1b4b',
          teal:  '#64ffda',
          green: '#3fb950',
          red:   '#f85149',
          gold:  '#e3b341',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'ticker':     'ticker 30s linear infinite',
        'pulse-dot':  'pulse-dot 1.5s infinite',
        'fade-up':    'fade-up 0.6s ease-out',
        'count-up':   'count-up 2s ease-out',
      },
      keyframes: {
        ticker:      { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
        'pulse-dot': { '0%,100%': { boxShadow: '0 0 0 0 rgba(76,175,80,0)' }, '70%': { boxShadow: '0 0 0 8px rgba(76,175,80,0)' } },
        'fade-up':   { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
      }
    },
  },
  plugins: [],
}
export default config
