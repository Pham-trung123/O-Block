/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Modern Purple/Blue Gradient Theme
        primary: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7c3aed',
          800: '#6b21a8',
          900: '#581c87',
        },
        secondary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        accent: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
        },
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        dark: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'large': '0 10px 40px -10px rgba(0, 0, 0, 0.15), 0 2px 10px -2px rgba(0, 0, 0, 0.05)',
        'xl-soft': '0 20px 50px -12px rgba(0, 0, 0, 0.1)',
        'glow': '0 0 20px rgba(124, 58, 237, 0.15)',
        'glow-lg': '0 0 40px rgba(124, 58, 237, 0.25)',
      },
      backdropBlur: {
        xs: '2px',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-primary': 'linear-gradient(135deg, #7c3aed 0%, #4361ee 50%, #06b6d4 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #a855f7 0%, #3b82f6 50%, #06b6d4 100%)',
        'gradient-accent': 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #7c3aed 100%)',
        'gradient-dark': 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
      },

      // 🎭 Animations
      keyframes: {
        // Fade In Up
        "fade-in-up": {
          "0%": { 
            opacity: "0", 
            transform: "translateY(20px)" 
          },
          "100%": { 
            opacity: "1", 
            transform: "translateY(0)" 
          },
        },
        
        // Fade In Down
        "fade-in-down": {
          "0%": { 
            opacity: "0", 
            transform: "translateY(-20px)" 
          },
          "100%": { 
            opacity: "1", 
            transform: "translateY(0)" 
          },
        },
        
        // Fade In Scale
        "fade-in-scale": {
          "0%": { 
            opacity: "0", 
            transform: "scale(0.95)" 
          },
          "100%": { 
            opacity: "1", 
            transform: "scale(1)" 
          },
        },
        
        // Slide In Left
        "slide-in-left": {
          "0%": { 
            opacity: "0", 
            transform: "translateX(-30px)" 
          },
          "100%": { 
            opacity: "1", 
            transform: "translateX(0)" 
          },
        },
        
        // Slide In Right
        "slide-in-right": {
          "0%": { 
            opacity: "0", 
            transform: "translateX(30px)" 
          },
          "100%": { 
            opacity: "1", 
            transform: "translateX(0)" 
          },
        },
        
        // Pulse Glow
        "pulse-glow": {
          "0%, 100%": { 
            boxShadow: "0 0 20px rgba(124, 58, 237, 0.3)" 
          },
          "50%": { 
            boxShadow: "0 0 40px rgba(124, 58, 237, 0.6)" 
          },
        },
        
        // Bounce Soft
        "bounce-soft": {
          "0%, 100%": { 
            transform: "translateY(0)" 
          },
          "50%": { 
            transform: "translateY(-5px)" 
          },
        },
        
        // Spin Slow
        "spin-slow": {
          "0%": { 
            transform: "rotate(0deg)" 
          },
          "100%": { 
            transform: "rotate(360deg)" 
          },
        },
        
        // Shimmer
        "shimmer": {
          "0%": { 
            backgroundPosition: "-200px 0" 
          },
          "100%": { 
            backgroundPosition: "calc(200px + 100%) 0" 
          },
        },
      },

      animation: {
        // Basic Animations
        "fade-in-up": "fade-in-up 0.6s ease-out",
        "fade-in-down": "fade-in-down 0.6s ease-out",
        "fade-in-scale": "fade-in-scale 0.5s ease-out",
        "slide-in-left": "slide-in-left 0.5s ease-out",
        "slide-in-right": "slide-in-right 0.5s ease-out",
        
        // Special Effects
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "bounce-soft": "bounce-soft 2s ease-in-out infinite",
        "spin-slow": "spin-slow 3s linear infinite",
        "shimmer": "shimmer 2s linear infinite",
        
        // Delayed Animations
        "fade-in-up-delay": "fade-in-up 0.6s ease-out 0.2s both",
        "fade-in-down-delay": "fade-in-down 0.6s ease-out 0.2s both",
        
        // Legacy Support (giữ lại từ bản cũ)
        "fade-in": "fade-in-up 0.5s ease-in-out",
        "fadeIn": "fade-in-up 0.6s ease-in-out",
      },
    },
  },
  plugins: [],
};