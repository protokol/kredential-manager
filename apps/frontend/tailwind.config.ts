import type { Config } from 'tailwindcss';

const { fontFamily } = require('tailwindcss/defaultTheme');

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    colors: {
      transparent: 'transparent',
      white: '#FFFFFF',
      slate: {
        50: '#F8FAFC',
        100: '#F1F5F9',
        200: '#E2E8F0',
        300: '#CBD5E1',
        400: '#94A3B8',
        500: '#64748B',
        600: '#475569',
        700: '#334155',
        800: '#1E293B',
        900: '#0F172A',
        950: '#020617'
      },
      sky: {
        50: '#F0F9FF',
        100: '#E0F2FE',
        200: '#BAE6FD',
        300: '#7DD3FC',
        400: '#38BDF8',
        500: '#0EA5E9',
        600: '#0284C7',
        700: '#0369A1',
        800: '#075985',
        900: '#0C4A6E',
        950: '#082F49'
      },
      green: {
        50: '#F0FDF4',
        100: '#DCFCE7',
        200: '#BBF7D0',
        300: '#86EFAC',
        400: '#4ADE80',
        500: '#22C55E',
        600: '#16A34A',
        700: '#15803D',
        800: '#166534',
        900: '#14532D',
        950: '#052E16'
      },
      red: {
        50: '#FEF2F2',
        100: '#FEE2E2',
        200: '#FECACA',
        300: '#FCA5A5',
        400: '#F87171',
        500: '#EF4444',
        600: '#DC2626',
        700: '#B91C1C',
        800: '#991B1B',
        900: '#7F1D1D',
        950: '#450A0A'
      },
      gold: {
        default: '#D4AF37',
        light: 'E1C054'
      }
    },
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))'
      },
      fontFamily: {
        sans: ['Inter', ...fontFamily.sans]
      },
      borderWidth: {
        1.5: '1.5px'
      },
      borderRadius: {
        2.5: '0.625rem' // 10px
      },
      minWidth: {
        32: '8rem', // 128px
        50: '12.5rem', // 200px
        64: '16rem', // 256px
        82: '20.5rem', // 328px
        'radix-select-trigger': 'var(--radix-select-trigger-width)'
      },
      maxWidth: {
        '1/2': '50%',
        30: '7.5rem', // 120px
        48: '12rem', // 192px,
        50: '12.5rem', // 200px
        56: '14rem', //224px
        70: '17.5rem', // 280px
        92: '23rem', // 368px
        98: '24.5rem', // 392px
        128: '32rem', // 512px
        203.25: '50.8125rem' // 813px
      },
      minHeight: {
        32: '8rem', // 128px,
        82: '20.5rem' // 328px
      },
      maxHeight: {
        '9/10': '90vh'
      },
      height: {
        7.5: '1.875rem', // 30px
        64: '16rem', // 256px
        'radix-select-trigger': 'var(--radix-select-trigger-height)'
      },
      inset: {
        '1/5': '20%',
        '1/10': '10%'
      },
      translate: {
        0.75: '0.1875rem', // 3px
        4.25: '1.0625rem' // 17px
      },
      strokeWidth: {
        2.5: '2.5'
      },
      margin: {
        '1.5px': '1.5px'
      },
      padding: {
        0.75: '0.1875rem', // 3px
        2.5: '0.625rem', // 10px
        4.5: '1.125rem', // 18px
        6.5: '1.625rem', // 26px
        18: '4.5rem' // 72px
      },
      width: {
        18: '4.5rem', // 72px
        50: '12.5rem', // 200px
        64: '16rem', // 256px
        '4/5': '80%',
        'radix-popover-trigger': 'var(--radix-popover-trigger-width)'
      },
      zIndex: {
        1: '1',
        2: '2',
        3: '3',
        modal: '100',
        select: '101',
        tooltip: '110'
      },
      boxShadow: {
        1: '0px 0px 2px 2px rgba(41, 37, 36, 0.04)'
      },
      transitionProperty: {
        width: 'width'
      },
      transitionDelay: {
        2000: '2000ms'
      },
      transitionDuration: {
        4000: '4000ms',
        5000: '5000ms',
        7000: '7000ms'
      },
      animation: {
        'radix-collapse-slide-down': 'radix-collapse-slide-down 150ms ease-out',
        'radix-collapse-slide-up': 'radix-collapse-slide-up 150ms ease-out',
        'enter-from-left': 'enter-from-left 150ms ease-out',
        'exit-to-left': 'exit-to-left 150ms ease-out',
        'fade-in': 'fade-in 150ms ease-out',
        'fade-out': 'fade-out 150ms ease-out',
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'translate-y-10': 'translate-y-10 6s ease-in-out infinite',
        'translate-y-25': 'translate-y-25 6s ease-in-out infinite',
        '-translate-y-25': '-translate-y-25 6s ease-in-out infinite'
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' }
        },
        'radix-collapse-slide-down': {
          from: {
            height: '0'
          },
          to: {
            height: 'var(--radix-collapsible-content-height)'
          }
        },
        'radix-collapse-slide-up': {
          from: {
            height: 'var(--radix-collapsible-content-height)'
          },
          to: {
            height: '0'
          }
        },
        'enter-from-left': {
          from: { opacity: '0', transform: 'translateX(-200px)' },
          to: { opacity: '1', transform: 'translateX(0)' }
        },
        'exit-to-left': {
          from: { opacity: '1', transform: 'translateX(0)' },
          to: { opacity: '0', transform: 'translateX(-200px)' }
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        'fade-out': {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' }
        },
        'translate-y-10': {
          '0%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
          '100%': { transform: 'translateY(0)' }
        },
        'translate-y-25': {
          '0%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-25px)' },
          '100%': { transform: 'translateY(0)' }
        },
        '-translate-y-25': {
          '0%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(25px)' },
          '100%': { transform: 'translateY(0)' }
        }
      }
    }
  },
  plugins: []
};

export default config;
