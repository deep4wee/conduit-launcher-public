/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
    theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            color: 'var(--text-primary)',
            a: { color: 'var(--color-accent)', '&:hover': { color: 'var(--text-primary)' } },
            h1: { color: 'var(--text-primary)' },
            h2: { color: 'var(--text-primary)' },
            h3: { color: 'var(--text-primary)' },
            h4: { color: 'var(--text-primary)' },
            strong: { color: 'var(--text-primary)' },
            code: { color: 'var(--text-primary)', backgroundColor: 'var(--bg-surface)', padding: '0.2em 0.4em', borderRadius: '0.25rem', fontWeight: '500' },
            'code::before': { content: '""' },
            'code::after': { content: '""' },
            blockquote: { color: 'var(--text-secondary)', borderLeftColor: 'var(--color-border)' },
          },
        },
      },
      colors: {
            
        background: "var(--bg-background)",
        surface: "var(--bg-surface)",
        surfaceHover: "var(--bg-surface-hover)",
        primary: "var(--text-primary)",
        secondary: "var(--text-secondary)",
        accent: "var(--color-accent)",
        border: "var(--color-border)",
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
        },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
            
    