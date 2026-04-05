/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)'],
      },
      fontSize: {
        // Analog design system — base sizes
        'xs':   ['12px', { lineHeight: '16px' }],
        'sm':   ['14px', { lineHeight: '20px' }],
        'base': ['16px', { lineHeight: '24px' }],
        'lg':   ['18px', { lineHeight: '24px' }],
        'xl':   ['20px', { lineHeight: '28px' }],
        '2xl':  ['24px', { lineHeight: '36px' }],
        '3xl':  ['28px', { lineHeight: '28px' }],
        '4xl':  ['30px', { lineHeight: '36px' }],
        '5xl':  ['32px', { lineHeight: '40px' }],
        '6xl':  ['36px', { lineHeight: '36px' }],
        '7xl':  ['40px', { lineHeight: '40px' }],
        '8xl':  ['48px', { lineHeight: '1.2' }],
        '9xl':  ['64px', { lineHeight: '1.2' }],
      },
      colors: {
        // Analog design system — neutral gray scale
        neutral: {
          50:  'var(--neutral-50)',
          75:  'var(--neutral-75)',
          100: 'var(--neutral-100)',
          150: 'var(--neutral-150)',
          200: 'var(--neutral-200)',
          300: 'var(--neutral-300)',
          400: 'var(--neutral-400)',
          500: 'var(--neutral-500)',
          600: 'var(--neutral-600)',
          700: 'var(--neutral-700)',
          800: 'var(--neutral-800)',
          850: 'var(--neutral-850)',
          900: 'var(--neutral-900)',
          950: 'var(--neutral-950)',
        },
        // shadcn/ui CSS-variable tokens
        background: {
          DEFAULT: 'var(--background)',
          top:     'var(--background-top)',
          bottom:  'var(--background-bottom)',
        },
        foreground:  'var(--foreground)',
        card: {
          DEFAULT:    'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        popover: {
          DEFAULT:    'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        primary: {
          DEFAULT:    'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT:    'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        muted: {
          DEFAULT:    'var(--muted)',
          foreground: 'var(--muted-foreground)',
          'foreground-2': 'var(--muted-foreground-2)',
        },
        accent: {
          DEFAULT:    'var(--accent)',
          foreground: 'var(--accent-foreground)',
          border:     'var(--accent-border)',
        },
        destructive: {
          DEFAULT:    'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },
        border:  'var(--border)',
        input:   'var(--input)',
        ring:    'var(--ring)',
        // Semantic tokens
        tag: {
          DEFAULT:    'var(--tag)',
          foreground: 'var(--tag-foreground)',
        },
        sheet: {
          DEFAULT:    'var(--sheet)',
          border:     'var(--sheet-border)',
        },
        button: {
          DEFAULT:    'var(--button)',
          border:     'var(--button-border)',
        },
        checkbox: {
          DEFAULT:    'var(--checkbox)',
          border:     'var(--checkbox-border)',
        },
        brand: {
          orange: 'var(--brand-orange)',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': { from: { height: '0' }, to: { height: 'var(--radix-accordion-content-height)' } },
        'accordion-up':   { from: { height: 'var(--radix-accordion-content-height)' }, to: { height: '0' } },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up':   'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [],
};
