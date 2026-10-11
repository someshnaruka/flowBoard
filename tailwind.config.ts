import type { Config } from 'tailwindcss'
import animate from 'tailwindcss-animate'

const config: Config = {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // Figma tokens (screens 04–05 / 21)
        brand: {
          50: '#F1EFFE',
          100: '#EEEAFC',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b7cf0',
          // Figma 05 / 04 tokens
          600: '#6E56CF',
          700: '#5b45b0',
          800: '#4a3894',
          900: '#3b2d75',
          // Tracks --primary so dark mode lifts brand (Figma 21–26)
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        status: {
          todo: {
            DEFAULT: '#94A3B8',
            foreground: '#ffffff',
            muted: '#F1F5F9',
          },
          active: {
            DEFAULT: '#3B82F6',
            foreground: '#ffffff',
            muted: '#EFF6FF',
          },
          done: {
            DEFAULT: '#22C55E',
            foreground: '#ffffff',
            muted: '#F0FDF4',
          },
        },
        priority: {
          urgent: {
            DEFAULT: '#EF4444',
            foreground: '#ffffff',
            muted: '#FEF2F2',
          },
          high: {
            DEFAULT: '#F97316',
            foreground: '#ffffff',
            muted: '#FFF7ED',
          },
          normal: {
            DEFAULT: '#3B82F6',
            foreground: '#ffffff',
            muted: '#EFF6FF',
          },
          low: {
            // Distinct from None — deeper slate (board/list parity)
            DEFAULT: '#64748B',
            foreground: '#ffffff',
            muted: '#E2E8F0',
          },
          none: {
            DEFAULT: '#94A3B8',
            foreground: '#0f172a',
            muted: '#FFFFFF',
          },
        },
        board: {
          // Column well (light slate @ ~45% / dark slate @ ~35%)
          column: 'rgb(226 232 240 / 0.45)',
          'column-dark': 'rgb(30 41 59 / 0.35)',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          'sans-serif',
          'Apple Color Emoji',
          'Segoe UI Emoji',
        ],
      },
      fontSize: {
        tiny: ['10px', { lineHeight: '16px', fontWeight: '400' }],
        badge: ['11px', { lineHeight: '1', fontWeight: '500' }],
        meta: ['12px', { lineHeight: '16px', fontWeight: '400' }],
        body: ['13px', { lineHeight: '20px', fontWeight: '400' }],
        'card-title': ['14px', { lineHeight: '20px', fontWeight: '500' }],
        'drawer-title': ['16px', { lineHeight: '24px', fontWeight: '500' }],
        'page-title': ['20px', { lineHeight: '28px', fontWeight: '600' }],
      },
      height: {
        badge: '18px',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        badge: '4px',
        control: '6px',
        card: '8px',
        drawer: '12px',
      },
      boxShadow: {
        card: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        panel: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        drawer:
          '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        focus: '0 0 0 2px rgb(110 86 207 / 0.35)',
      },
      spacing: {
        'tree-row': '28px',
        'list-row': '36px',
        'top-bar': '48px',
        'view-bar': '44px',
        sidebar: '260px',
        'sidebar-collapsed': '56px',
        column: '288px',
        drawer: '520px',
      },
      keyframes: {
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-4px)' },
          '40%': { transform: 'translateX(4px)' },
          '60%': { transform: 'translateX(-3px)' },
          '80%': { transform: 'translateX(3px)' },
        },
      },
      animation: {
        shake: 'shake 0.4s ease-in-out',
      },
    },
  },
  plugins: [animate],
}

export default config
