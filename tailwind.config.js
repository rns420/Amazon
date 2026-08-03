/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: { DEFAULT: 'rgb(var(--bg) / <alpha-value>)', soft: 'rgb(var(--bg-soft) / <alpha-value>)' },
        fg: { DEFAULT: 'rgb(var(--fg) / <alpha-value>)', soft: 'rgb(var(--fg-soft) / <alpha-value>)', muted: 'rgb(var(--fg-muted) / <alpha-value>)' },
        border: { DEFAULT: 'rgb(var(--border) / <alpha-value>)', soft: 'rgb(var(--border-soft) / <alpha-value>)' },
        brand: {
          50: '#eef6ff', 100: '#d9eaff', 200: '#bcd9ff', 300: '#8ec0ff', 400: '#599cff',
          500: '#3478f6', 600: '#205be0', 700: '#1b49b8', 800: '#1c3f95', 900: '#1c3876',
        },
        accent: {
          50: '#fff7ed', 100: '#ffedd5', 200: '#fed7aa', 300: '#fdba74', 400: '#fb923c',
          500: '#f97316', 600: '#ea580c', 700: '#c2410c', 800: '#9a3412', 900: '#7c2d12',
        },
        success: { 500: '#22c55e', 600: '#16a34a', 50: '#f0fdf4' },
        warning: { 500: '#f59e0b', 600: '#d97706', 50: '#fffbeb' },
        danger: { 500: '#ef4444', 600: '#dc2626', 50: '#fef2f2' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgb(0 0 0 / 0.04), 0 1px 3px rgb(0 0 0 / 0.06)',
        pop: '0 8px 24px rgb(0 0 0 / 0.12)',
      },
      keyframes: {
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'slide-up': { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
      animation: { 'fade-in': 'fade-in 0.2s ease-out', 'slide-up': 'slide-up 0.25s ease-out' },
    },
  },
  plugins: [],
}
