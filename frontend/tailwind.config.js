/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx}", "./public/index.html"],
  theme: {
    extend: {
      spacing: {
        '4.5': '1.125rem',
        '5.5': '1.375rem',
        '13': '3.25rem',
        '18': '4.5rem',
        '22': '5.5rem',
        '26': '6.5rem',
        '30': '7.5rem',
      },
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
        head: ['Outfit', 'sans-serif'],
        plex: ['"IBM Plex Sans"', 'sans-serif'],
      },
      colors: {
        // Text / neutral ink
        ink: '#0F172A',
        inkhover: '#1E293B',
        canvas: '#F8FAFC',
        surface: '#FFFFFF',
        'surface-2': '#F8FAFC',
        'surface-elevated': '#FFFFFF',
        line: '#E4E7F2',
        'line-strong': '#CBD0E8',
        muted: '#64748B',
        'muted-light': '#94A3B8',
        // Deep blue brand (academic trust)
        brand: {
          50:  '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },
        status: {
          pending:   '#F59E0B',
          borrowed:  '#10B981',
          cancelled: '#EF4444',
          overdue:   '#EF4444',
          completed: '#3B82F6',
          available: '#10B981',
        },
        // Semantic elevation surfaces (for depth layering)
        elevation: {
          1: '#FFFFFF',
          2: '#F8FAFC',
          3: '#EFF6FF',
        },
      },
      boxShadow: {
        // Base layers
        soft:    '0 2px 8px rgba(15,23,42,0.06)',
        card:    '0 1px 2px rgba(15,23,42,0.04), 0 12px 28px -16px rgba(15,23,42,0.16)',
        'card-hover': '0 2px 4px rgba(15,23,42,0.06), 0 20px 40px -16px rgba(15,23,42,0.24)',
        pop:     '0 24px 60px -24px rgba(15,23,42,0.30)',
        float:   '0 8px 32px -8px rgba(15,23,42,0.22)',
        elevated:'0 32px 80px -32px rgba(15,23,42,0.38)',
        // Brand glows
        glow:    '0 10px 30px -8px rgba(37,99,235,0.45)',
        'glow-sm':'0 6px 18px -6px rgba(37,99,235,0.38)',
        'glow-lg':'0 16px 48px -12px rgba(37,99,235,0.55)',
        'glow-warm':'0 10px 30px -8px rgba(245,158,11,0.45)',
        'glow-success':'0 10px 30px -8px rgba(16,185,129,0.40)',
        'glow-danger':'0 10px 30px -8px rgba(239,68,68,0.40)',
        // Inner shadows
        'inner-brand':'inset 0 1px 3px rgba(30,58,138,0.15)',
        'inner-soft': 'inset 0 1px 2px rgba(15,23,42,0.06)',
      },
      borderRadius: {
        '2.5xl': '1.25rem',
        '4xl':   '2rem',
        '5xl':   '2.5rem',
        '6xl':   '3rem',
      },
      backgroundImage: {
        'brand-gradient':   'linear-gradient(135deg, #3B82F6 0%, #1E3A8A 100%)',
        'brand-glow':       'radial-gradient(120% 120% at 0% 0%, #3B82F6 0%, #2563EB 55%, #1D4ED8 100%)',
        'brand-warm':       'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
        'brand-cool':       'linear-gradient(135deg, #3B82F6 0%, #06B6D4 100%)',
        'success-gradient': 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
        'danger-gradient':  'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
        'amber-gradient':   'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
        'dark-gradient':    'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
        'mesh-brand':       'radial-gradient(at 40% 20%, rgba(59,130,246,0.15) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(37,99,235,0.12) 0px, transparent 50%), radial-gradient(at 0% 50%, rgba(30,58,138,0.10) 0px, transparent 50%)',
        'mesh-warm':        'radial-gradient(at 40% 20%, rgba(245,158,11,0.15) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(217,119,6,0.12) 0px, transparent 50%)',
        'hero-overlay':     'linear-gradient(to top, rgba(15,23,42,0.92) 0%, rgba(15,23,42,0.4) 50%, rgba(15,23,42,0.12) 100%)',
        'hero-overlay-lg':  'linear-gradient(to top, rgba(15,23,42,0.96) 0%, rgba(15,23,42,0.55) 45%, transparent 100%)',
        'card-shine':       'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.28) 50%, transparent 70%)',
      },
      keyframes: {
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-down': {
          '0%':   { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'pop-in': {
          '0%':   { opacity: '0', transform: 'scale(0.92)' },
          '60%':  { transform: 'scale(1.03)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'scale-in': {
          '0%':   { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'slide-in-right': {
          '0%':   { opacity: '0', transform: 'translateX(24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-in-left': {
          '0%':   { opacity: '0', transform: 'translateX(-24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-up-fade': {
          '0%':   { opacity: '0', transform: 'translateY(20px) scale(0.98)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'scan-line': {
          '0%':   { top: '0%' },
          '100%': { top: '100%' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        'shimmer-soft': {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%':     { transform: 'translateY(-8px)' },
        },
        'float-gentle': {
          '0%,100%': { transform: 'translateY(0) rotate(0deg)' },
          '33%':     { transform: 'translateY(-4px) rotate(0.5deg)' },
          '66%':     { transform: 'translateY(-2px) rotate(-0.5deg)' },
        },
        'pulse-soft': {
          '0%,100%': { opacity: '1' },
          '50%':     { opacity: '0.45' },
        },
        'pulse-brand': {
          '0%,100%': { boxShadow: '0 0 0 0 rgba(37,99,235,0.4)' },
          '50%':     { boxShadow: '0 0 0 8px rgba(37,99,235,0)' },
        },
        'gradient-pan': {
          '0%,100%': { backgroundPosition: '0% 50%' },
          '50%':     { backgroundPosition: '100% 50%' },
        },
        'ring-pop': {
          '0%':   { transform: 'scale(0.8)', opacity: '0.6' },
          '100%': { transform: 'scale(1.8)', opacity: '0' },
        },
        'bounce-gentle': {
          '0%,100%': { transform: 'translateY(0)', animationTimingFunction: 'cubic-bezier(0.8,0,1,1)' },
          '50%':     { transform: 'translateY(-6px)', animationTimingFunction: 'cubic-bezier(0,0,0.2,1)' },
        },
        'rotate-slow': {
          '0%':   { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'tilt': {
          '0%,100%': { transform: 'rotate(-1deg)' },
          '50%':     { transform: 'rotate(1deg)' },
        },
        'draw-circle': {
          '0%':   { strokeDashoffset: '283' },
          '100%': { strokeDashoffset: '0' },
        },
        'trust-ring': {
          '0%':   { strokeDashoffset: '283' },
        },
        'count-pulse': {
          '0%,100%': { transform: 'scale(1)' },
          '50%':     { transform: 'scale(1.12)' },
        },
        'notification-ping': {
          '0%':   { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(2.2)', opacity: '0' },
        },
        'hero-ken-burns': {
          '0%':   { transform: 'scale(1) translate(0, 0)' },
          '100%': { transform: 'scale(1.08) translate(-1%, -1%)' },
        },
        'shine': {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        'wave': {
          '0%':   { transform: 'rotate(0deg)' },
          '20%':  { transform: 'rotate(14deg)' },
          '40%':  { transform: 'rotate(-8deg)' },
          '60%':  { transform: 'rotate(14deg)' },
          '80%':  { transform: 'rotate(-4deg)' },
          '100%': { transform: 'rotate(10deg)' },
        },
      },
      animation: {
        'fade-up':         'fade-up 0.45s cubic-bezier(0.22,1,0.36,1) both',
        'fade-down':       'fade-down 0.35s cubic-bezier(0.22,1,0.36,1) both',
        'fade-in':         'fade-in 0.3s ease both',
        'pop-in':          'pop-in 0.32s cubic-bezier(0.22,1,0.36,1) both',
        'scale-in':        'scale-in 0.28s cubic-bezier(0.22,1,0.36,1) both',
        'scan-line':       'scan-line 2s ease-in-out infinite alternate',
        shimmer:           'shimmer 1.6s infinite',
        'shimmer-soft':    'shimmer-soft 2.4s linear infinite',
        'slide-in-right':  'slide-in-right 0.35s cubic-bezier(0.22,1,0.36,1) both',
        'slide-in-left':   'slide-in-left 0.35s cubic-bezier(0.22,1,0.36,1) both',
        'slide-up-fade':   'slide-up-fade 0.4s cubic-bezier(0.22,1,0.36,1) both',
        float:             'float 6s ease-in-out infinite',
        'float-gentle':    'float-gentle 8s ease-in-out infinite',
        'pulse-soft':      'pulse-soft 1.8s ease-in-out infinite',
        'pulse-brand':     'pulse-brand 2s ease-in-out infinite',
        'gradient-pan':    'gradient-pan 8s ease infinite',
        'ring-pop':        'ring-pop 1s ease-out infinite',
        'bounce-gentle':   'bounce-gentle 1.4s infinite',
        'rotate-slow':     'rotate-slow 12s linear infinite',
        tilt:              'tilt 3s ease-in-out infinite',
        'count-pulse':     'count-pulse 0.3s ease',
        'notif-ping':      'notification-ping 1.2s ease-out infinite',
        'hero-ken-burns':  'hero-ken-burns 14s ease-in-out infinite alternate',
        shine:             'shine 2.4s linear infinite',
        wave:              'wave 1.5s ease-in-out',
        'draw-circle':     'draw-circle 1s cubic-bezier(0.22,1,0.36,1) both',
      },
      transitionTimingFunction: {
        'ease-spring':   'cubic-bezier(0.22, 1, 0.36, 1)',
        'ease-overshoot':'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'ease-smooth':   'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      backdropBlur: {
        xs: '2px',
        '2xs': '1px',
      },
    },
  },
  plugins: [],
};
