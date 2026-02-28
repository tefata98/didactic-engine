/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        base: {
          DEFAULT: '#0f172a',
          light: '#1e293b',
          lighter: '#334155',
        },
        accent: {
          primary: '#6366f1',
          secondary: '#8b5cf6',
          tertiary: '#a78bfa',
          sleep: '#818cf8',
          fitness: '#a78bfa',
          finance: '#22c55e',
          vocals: '#ec4899',
          work: '#6366f1',
          reading: '#c084fc',
          health: '#f59e0b',
        },
        glass: {
          bg: 'rgba(255,255,255,0.04)',
          border: 'rgba(255,255,255,0.08)',
          hover: 'rgba(255,255,255,0.08)',
        },
      },
      fontFamily: {
        heading: ['Outfit', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
      },
      borderRadius: {
        glass: '24px',
      },
      backdropBlur: {
        glass: '24px',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        fadeInUp: 'fadeInUp 0.4s ease-out',
        shimmer: 'shimmer 2s linear infinite',
        pulseGlow: 'pulseGlow 4s ease-in-out infinite',
        slideUp: 'slideUp 0.3s ease-out',
        scaleIn: 'scaleIn 0.2s ease-out',
      },
    },
  },
  plugins: [],
}
