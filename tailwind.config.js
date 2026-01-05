/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.75rem', letterSpacing: '0.025em' }],
        'xs': ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.025em' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0.01em' }],
        'base': ['1rem', { lineHeight: '1.5rem', letterSpacing: '0.01em' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem', letterSpacing: '0' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem', letterSpacing: '-0.01em' }],
        '2xl': ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.025em' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem', letterSpacing: '-0.025em' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem', letterSpacing: '-0.025em' }],
        '5xl': ['3rem', { lineHeight: '1.2', letterSpacing: '-0.025em' }],
        '6xl': ['3.75rem', { lineHeight: '1.1', letterSpacing: '-0.025em' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
        '0.75': '0.1875rem',
        '1.25': '0.3125rem',
        '2.25': '0.5625rem',
        '3.75': '0.9375rem',
        '4.5': '1.125rem',
        '5.5': '1.375rem',
        '6.5': '1.625rem',
        '7.5': '1.875rem',
        '8.5': '2.125rem',
        '9.5': '2.375rem',
        '11': '2.75rem',
        '13': '3.25rem',
        '15': '3.75rem',
        '17': '4.25rem',
        '19': '4.75rem',
        '21': '5.25rem',
        '22': '5.5rem',
        '26': '6.5rem',
        '30': '7.5rem',
      },
      colors: {
        // Single accent color system - clean and minimal
        primary: {
          DEFAULT: '#00d4c4',
          50: '#f0fdfc',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#00d4c4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
        },
        // Clean grayscale system
        gray: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0a0a0a',
        },
        // Surface colors for dark theme
        surface: {
          DEFAULT: 'rgba(44, 44, 46, 0.8)',
          secondary: 'rgba(58, 58, 60, 0.6)',
          elevated: 'rgba(72, 72, 74, 0.4)',
        },
        // Text colors
        text: {
          primary: '#ffffff',
          secondary: 'rgba(255, 255, 255, 0.85)',
          tertiary: 'rgba(255, 255, 255, 0.65)',
          quaternary: 'rgba(255, 255, 255, 0.45)',
        },
        // Glass system
        glass: {
          50: 'rgba(28, 28, 30, 0.95)',
          100: 'rgba(28, 28, 30, 0.9)',
          200: 'rgba(28, 28, 30, 0.85)',
          300: 'rgba(28, 28, 30, 0.8)',
          400: 'rgba(28, 28, 30, 0.75)',
          500: 'rgba(28, 28, 30, 0.7)',
        }
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
        '6xl': '3rem',
        '7xl': '3.5rem',
      },
      boxShadow: {
        'primary': '0 4px 16px rgba(0, 212, 196, 0.25)',
        'small': '0 2px 8px rgba(0, 0, 0, 0.15)',
        'medium': '0 4px 16px rgba(0, 0, 0, 0.2)',
        'large': '0 8px 32px rgba(0, 0, 0, 0.25)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)',
        'glass-lg': '0 16px 48px rgba(0, 0, 0, 0.16), 0 4px 12px rgba(0, 0, 0, 0.12)',
      },
      backdropBlur: {
        xs: '2px',
        '4xl': '72px',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'glass-gradient': 'linear-gradient(135deg, rgba(28,28,30,0.9) 0%, rgba(28,28,30,0.7) 100%)',
      },
      scale: {
        '98': '0.98',
        '102': '1.02',
      },
    },
  },
  plugins: [],
};
