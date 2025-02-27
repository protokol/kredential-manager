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
        500: '#04AAFF',
        600: '#04AAFF',
        700: '#0369A1',
        800: '#075985',
        900: '#04AAFF',
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
        'radial-gradient':
          'radial-gradient(221.2% 94.09% at 7.14% 18.61%, #F0F9FF 0%, #FFF 100%)',
        'linear-gradient':
          'linear-gradient(270deg, #F0F9FF 0%, rgba(240,249,255,1) 0%, #F0F9FF 100%, rgba(255,255,255,1) 100%, rgba(0,212,255,1) 100%)',
        'linear-gradient-2': 'linear-gradient(to right, #F0F9FF, white)',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))'
      },
      fontFamily: {
        sans: ['Inter', ...fontFamily.sans]
      },
      borderWidth: {
        1.5: '1.5px'
      },
      transitionProperty: {
        width: 'width'
      },
      transitionDelay: {
        2000: '2000ms'
      },
      width: {
        18: '4.5rem', // 72px
        20: '5rem',
        30: '7.5rem', // 120px
        50: '12.5rem', // 200px
        64: '16rem', // 256px
        '4/5': '80%',
        128: '32rem', // 512px
        192: '48rem', // 768px
        'content-w': 'calc(100% - 224px)',
        'radix-popover-trigger': 'var(--radix-popover-trigger-width)'
      },
      height: {
        156: '39rem', // 624px,
        172: '43rem', // 688px
        176: '44rem', // 704px
        184: '46rem', // 736px
        192: '48rem', // 768px
        196: '49rem', // 784px
        228: '57rem' // 912px
      },
      minHeight: {
        172: '43rem' // 688px
      },
      maxHeight: {
        '60vh': '60vh'
      },
      maxWidth: {
        '69vw': '69vw',
        '82vw': '82vw',
        'content-w': 'calc(100vw - 330px)'
      },
      transitionDuration: {
        4000: '4000ms',
        5000: '5000ms',
        7000: '7000ms'
      },
      animation: {
        'radix-collapse-slide-down': 'radix-collapse-slide-down 150ms ease-out',
        'radix-collapse-slide-up': 'radix-collapse-slide-up 150ms ease-out',
        'spin-infinite': 'spin 2s linear infinite',
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 150ms ease-out',
        'fade-out': 'fade-out 150ms ease-out'
      },
      keyframes: {
        spin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' }
        },
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
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        'fade-out': {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' }
        }
      }
    }
  },
  plugins: [require('tailwindcss-animate')]
};

export default config;
