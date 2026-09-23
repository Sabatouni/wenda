import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ─── WENDA brand greens ────────────────────────────────
        // Exact logo forest green: #0B2D1A  (brand deep bg)
        forest: {
          50:  '#f0f8f2',
          100: '#d4eddb',
          200: '#a9dbb8',
          300: '#72c28e',
          400: '#3fa664',
          500: '#1e8848',  // primary action green
          600: '#156e3b',
          700: '#0f5730',
          800: '#0b4024',
          900: '#0b2d1a',  // exact logo forest green
          950: '#051509',
        },
        // ─── WENDA orange — the dot ─────────────────────────────
        // Exact logo orange: #E85D04
        ember: {
          50:  '#fff5ec',
          100: '#ffe8cc',
          200: '#ffd09a',
          300: '#ffb064',
          400: '#ff8c34',
          500: '#e85d04',  // exact logo dot orange
          600: '#c94b02',
          700: '#a53c02',
          800: '#822f08',
          900: '#6b270a',
        },
        // ─── WENDA cream — W mark + backgrounds ────────────────
        // Exact logo cream: #F5EDD8
        sand: {
          50:  '#fffef9',
          100: '#fdf9ef',
          200: '#faf6ef',  // primary light background
          300: '#f5eedd',  // exact logo W mark cream
          400: '#eadfc7',
          500: '#d9caab',
          600: '#c2ae88',
          700: '#a38e65',
          800: '#7d6b48',
          900: '#5c4d33',
        },
        // ─── Neutral/stone ──────────────────────────────────────
        ink: {
          50:  '#f6f7f6',
          100: '#e8ecea',
          200: '#ccd5cf',
          300: '#a4b3aa',
          400: '#7a8f83',
          500: '#5d7269',
          600: '#475a52',
          700: '#394843',
          800: '#2e3b37',
          900: '#0f1a14',  // primary dark text
          950: '#080d0a',
        },
      },
      fontFamily: {
        display: ['var(--font-space-grotesk)', 'system-ui', 'sans-serif'],
        sans:    ['var(--font-inter)',         'system-ui', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '8px',
        'sm':   '6px',
        'md':   '10px',
        'lg':   '14px',
        'xl':   '20px',
        '2xl':  '28px',
        '3xl':  '36px',
        'full': '9999px',
      },
      boxShadow: {
        'sm':    '0 1px 2px rgba(0,0,0,0.05)',
        'card':  '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.06)',
        'hover': '0 4px 8px rgba(0,0,0,0.08), 0 12px 32px rgba(0,0,0,0.10)',
        'float': '0 8px 16px rgba(0,0,0,0.10), 0 24px 48px rgba(0,0,0,0.12)',
        'nav':   '0 -1px 0 rgba(0,0,0,0.06)',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.175, 0.885, 0.32, 1.1)',
        'smooth': 'cubic-bezier(0.2, 0, 0, 1)',
      },
      screens: {
        'xs': '390px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1440px',
      },
    },
  },
  plugins: [],
}

export default config
