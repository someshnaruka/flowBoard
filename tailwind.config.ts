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
        brand: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          DEFAULT: '#7c3aed',
          foreground: '#ffffff',
        },
        status: {
          todo: {
            DEFAULT: '#64748b',
            foreground: '#ffffff',
            muted: '#f1f5f9',
          },
          active: {
            DEFAULT: '#2563eb',
            foreground: '#ffffff',
            muted: '#eff6ff',
          },
          done: {
            DEFAULT: '#16a34a',
            foreground: '#ffffff',
            muted: '#f0fdf4',
          },
        },
        priority: {
          urgent: {
            DEFAULT: '#dc2626',
            foreground: '#ffffff',
            muted: '#fef2f2',
          },
          high: {
            DEFAULT: '#ea580c',
            foreground: '#ffffff',
            muted: '#fff7ed',
          },
          normal: {
            DEFAULT: '#2563eb',
            foreground: '#ffffff',
            muted: '#eff6ff',
          },
          low: {
            DEFAULT: '#64748b',
            foreground: '#ffffff',
            muted: '#f1f5f9',
          },
          none: {
            DEFAULT: '#94a3b8',
            foreground: '#0f172a',
            muted: '#f8fafc',
          },
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
        meta: ['12px', { lineHeight: '16px', fontWeight: '400' }],
        body: ['13px', { lineHeight: '20px', fontWeight: '400' }],
        'card-title': ['14px', { lineHeight: '20px', fontWeight: '500' }],
        'drawer-title': ['16px', { lineHeight: '24px', fontWeight: '500' }],
        'page-title': ['20px', { lineHeight: '28px', fontWeight: '600' }],
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
        focus: '0 0 0 2px rgb(124 58 237 / 0.35)',
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
    },
  },
  plugins: [animate],
}

export default config
