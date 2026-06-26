import type { Config } from 'tailwindcss'
const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
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
    },
  },
  plugins: [],
}
export default config
