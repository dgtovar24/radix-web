/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        radix: {
          50:  'var(--color-radix-50)',
          100: 'var(--color-radix-100)',
          200: 'var(--color-radix-200)',
          300: 'var(--color-radix-300)',
          400: 'var(--color-radix-400)',
          500: 'var(--color-radix-500)',
          600: 'var(--color-radix-600)',
          700: 'var(--color-radix-700)',
          800: 'var(--color-radix-800)',
          900: 'var(--color-radix-900)',
          950: 'var(--color-radix-950)',
        },
        alert: {
          red:   'var(--color-alert-red)',
          amber: 'var(--color-alert-amber)',
        },
        success:  'var(--color-success)',
        info:     'var(--color-info)',
        sidebar:  'var(--color-sidebar)',
        bg: {
          primary:   'var(--color-bg-primary)',
          secondary: 'var(--color-bg-secondary)',
        },
      },
      fontFamily: {
        heading: ['Outfit', 'system-ui', 'sans-serif'],
        sans:    ['"DM Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        mono:    ['"IBM Plex Mono"', 'Menlo', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'card':        'var(--shadow-sm)',
        'card-hover':  'var(--shadow-md)',
        'elevated':    'var(--shadow-lg)',
        'float':       'var(--shadow-xl)',
        'glow':        'var(--shadow-glow)',
        'btn':         'var(--shadow-btn)',
        'inner-glow':  'inset 0 1px 0 rgba(255,255,255,0.08)',
      },
      animation: {
        'fade-in':       'fadeIn 0.35s ease-out both',
        'slide-up':      'slideUp 0.45s cubic-bezier(0.22,1,0.36,1) both',
        'float':         'float 6s ease-in-out infinite',
        'float-slow':    'float 9s ease-in-out infinite',
        'float-reverse': 'floatReverse 7s ease-in-out infinite',
        'pulse-glow':    'pulseGlow 3s ease-in-out infinite',
        'ping-slow':     'ping 1.8s cubic-bezier(0,0,0.2,1) infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%':      { transform: 'translateY(-14px) rotate(2deg)' },
        },
        floatReverse: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%':      { transform: 'translateY(10px) rotate(-2deg)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.5' },
          '50%':      { opacity: '0.9' },
        },
        ping: {
          '75%, 100%': { transform: 'scale(2)', opacity: '0' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
