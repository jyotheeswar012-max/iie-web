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
          teal:   '#64ffda',
          blue:   '#82b1ff',
          purple: '#e040fb',
          green:  '#3fb950',
          red:    '#f85149',
          orange: '#e3b341',
          navy:   '#0a0e27',
          dark:   '#0d1117',
          card:   '#161b22',
          border: '#21262d',
          muted:  '#7d8590',
          text:   '#e6edf3',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'ticker': 'ticker 30s linear infinite',
        'pulse-dot': 'pulse-dot 1.5s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        ticker: {
          '0%':   { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'pulse-dot': {
          '0%,100%': { boxShadow: '0 0 0 0 rgba(100,255,218,0.6)' },
          '70%':     { boxShadow: '0 0 0 8px rgba(100,255,218,0)' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%':     { transform: 'translateY(-12px)' },
        },
        glow: {
          '0%':   { textShadow: '0 0 20px rgba(100,255,218,0.3)' },
          '100%': { textShadow: '0 0 40px rgba(100,255,218,0.8)' },
        },
      },
    },
  },
  plugins: [],
}
export default config
