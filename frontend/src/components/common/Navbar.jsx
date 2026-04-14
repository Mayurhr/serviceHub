import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { user, logout, isAdmin, isProvider } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [drop, setDrop] = useState(false);
  const nav = p => pathname === p ? 'text-saffron-500 font-semibold' : 'text-ink-600 hover:text-saffron-500';

  const handleLogout = () => { logout(); navigate('/'); setDrop(false); setOpen(false); };

const userMenuItems = isProvider
  ? [
      ['🏠 My Dashboard', '/provider/dashboard'],
      ['👤 Profile', '/profile']
    ]
  : isAdmin
  ? [
      ['⚙️ Admin Panel', '/admin']
    ]
  : [
      ['👤 Profile', '/profile'],
      ['📊 Dashboard', '/dashboard'],
      ['📅 My Bookings', '/my-bookings']
    ];

  return (
    <nav className="bg-white border-b border-ink-100 sticky top-0 z-50" style={{ boxShadow: '0 1px 12px rgba(0,0,0,0.06)' }}>
      <div className="page-container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-saffron-gradient rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-lg">⚡</span>
            </div>
            <div>
              <span className="font-bold text-xl text-ink-900">Serve</span>
              <span className="font-bold text-xl text-saffron-500">Ease</span>
              <span className="text-[10px] bg-saffron-100 text-saffron-600 font-bold px-1.5 py-0.5 rounded ml-1 align-top">PRO</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {!isProvider && (
              <>
                <Link to="/" className={`text-sm font-medium transition-colors ${nav('/')}`}>Home</Link>
                <Link to="/services" className={`text-sm font-medium transition-colors ${nav('/services')}`}>Services</Link>
                <Link to="/providers" className={`text-sm font-medium transition-colors ${nav('/providers')}`}>Providers</Link>
                {user && !isAdmin && <Link to="/dashboard" className={`text-sm font-medium transition-colors ${nav('/dashboard')}`}>Dashboard</Link>}
                {isAdmin && <Link to="/admin" className={`text-sm font-medium transition-colors ${nav('/admin')}`}>Admin</Link>}
              </>
            )}
            {isProvider && (
              <Link to="/provider/dashboard" className={`text-sm font-medium transition-colors ${nav('/provider/dashboard')}`}>My Dashboard</Link>
            )}
          </div>

          {/* Desktop user menu */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button onClick={() => setDrop(!drop)} className="flex items-center gap-2.5 bg-ink-50 hover:bg-ink-100 px-3 py-2 rounded-xl transition-colors">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                    style={{ background: isProvider ? 'linear-gradient(135deg,#7c3aed,#6366f1)' : 'linear-gradient(135deg,#f97316,#ea580c)' }}>
                    {user.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-ink-700">{user.name?.split(' ')[0]}</p>
                    <p className="text-[10px] text-ink-400 capitalize">{user.role}</p>
                  </div>
                  <svg className={`w-4 h-4 text-ink-400 transition-transform ${drop ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
                </button>
                {drop && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-ink-100 py-2 z-50 animate-scale-in">
                    {userMenuItems.map(([l, p]) => (
                      <Link key={p} to={p} onClick={() => setDrop(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-ink-700 hover:bg-saffron-50 hover:text-saffron-600 transition-colors">{l}</Link>
                    ))}
                    <hr className="my-1 border-ink-100" />
                    <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">🚪 Logout</button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/provider-login" className="btn-ghost text-sm text-violet-600 hover:bg-violet-50">Provider Login</Link>
                <Link to="/login" className="btn-ghost text-sm">Login</Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-5">Get Started</Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setOpen(!open)} className="md:hidden p-2 rounded-lg hover:bg-ink-100">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={open ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden py-4 border-t border-ink-100 animate-slide-up space-y-1">
            {!isProvider && (
              <>
                <Link to="/" onClick={() => setOpen(false)} className="block px-4 py-2.5 text-sm font-medium text-ink-700 hover:bg-saffron-50 rounded-xl">Home</Link>
                <Link to="/services" onClick={() => setOpen(false)} className="block px-4 py-2.5 text-sm font-medium text-ink-700 hover:bg-saffron-50 rounded-xl">Services</Link>
                <Link to="/providers" onClick={() => setOpen(false)} className="block px-4 py-2.5 text-sm font-medium text-ink-700 hover:bg-saffron-50 rounded-xl">Providers</Link>
              </>
            )}
            {user ? (
              <>
                {userMenuItems.map(([l, p]) => (
                  <Link key={p} to={p} onClick={() => setOpen(false)} className="block px-4 py-2.5 text-sm font-medium text-ink-700 hover:bg-saffron-50 rounded-xl">{l}</Link>
                ))}
                <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl">🚪 Logout</button>
              </>
            ) : (
              <div className="px-4 pt-2 space-y-2">
                <Link to="/provider-login" onClick={() => setOpen(false)} className="block w-full text-center py-2.5 text-sm font-semibold text-violet-600 border border-violet-200 hover:bg-violet-50 rounded-xl">Provider Login</Link>
                <div className="flex gap-2">
                  <Link to="/login" onClick={() => setOpen(false)} className="btn-secondary flex-1 text-sm py-2">Login</Link>
                  <Link to="/register" onClick={() => setOpen(false)} className="btn-primary flex-1 text-sm py-2">Register</Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
