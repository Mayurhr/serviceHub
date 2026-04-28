export default {
  content: ['./index.html','./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['DM Sans','sans-serif'], display: ['Clash Display','DM Sans','sans-serif'] },
      colors: {
        saffron: { 50:'#fff7ed', 100:'#ffedd5', 200:'#fed7aa',300:'#fdba74',  400:'#fb923c', 500:'#f97316', 600:'#ea580c', 700:'#c2410c' },
        forest: { 50:'#f0fdf4', 400:'#4ade80', 500:'#22c55e', 600:'#16a34a', 700:'#15803d' },
        ocean: { 50:'#eff6ff', 100:'#dbeafe', 400:'#60a5fa', 500:'#3b82f6', 600:'#2563eb', 700:'#1d4ed8' },
        violet: { 50:'#f5f3ff', 100:'#ede9fe', 400:'#a78bfa', 500:'#8b5cf6', 600:'#7c3aed', 700:'#6d28d9' },
        rose: { 400:'#fb7185', 500:'#f43f5e', 600:'#e11d48' },
        ink: { 50:'#f8fafc', 100:'#f1f5f9', 200:'#e2e8f0', 300:'#cbd5e1', 400:'#94a3b8', 500:'#64748b', 600:'#475569', 700:'#334155', 800:'#1e293b', 900:'#0f172a' },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease',
        'slide-up': 'slideUp 0.4s ease',
        'scale-in': 'scaleIn 0.3s ease',
        'pulse-slow': 'pulse 3s infinite',
        'bounce-slow': 'bounce 2s infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        scaleIn: { from: { opacity: 0, transform: 'scale(0.95)' }, to: { opacity: 1, transform: 'scale(1)' } },
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0,0,0,0.06)',
        'card-hover': '0 16px 32px rgba(0,0,0,0.12)',
        'glow': '0 0 20px rgba(249,115,22,0.3)',
      }
    }
  },
  plugins: [],
}
