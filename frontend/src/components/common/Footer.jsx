import { Link } from 'react-router-dom';
import { ALLOWED_CITIES } from '../../utils/api';

export default function Footer() {
  return (
    <footer className="bg-ink-900 text-ink-300 mt-auto">
      <div className="page-container py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-saffron-gradient rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">⚡</span>
              </div>
              <span className="font-bold text-xl text-white">
                Serve<span className="text-saffron-400">Ease</span>
                <span className="text-xs bg-saffron-800 text-saffron-300 px-1.5 py-0.5 rounded ml-1">PRO</span>
              </span>
            </div>
            <p className="text-ink-400 text-sm leading-relaxed mb-4 max-w-xs">
              Book verified local service professionals in 
            </p>
            <div className="flex gap-2 flex-wrap">
              {ALLOWED_CITIES.map(city => (
                <Link key={city} to={`/providers?city=${city}`}
                  className="text-[10px] bg-ink-800 hover:bg-saffron-700 text-ink-300 px-2 py-1 rounded-lg transition-colors font-medium">
                  📍 {city}
                </Link>
              ))}
            </div>
          </div>

          {[
            ['Services', [
              ['/services?category=home-services', 'Home Services'],
              ['/services?category=tech-services', 'Tech Services'],
              ['/services?category=education', 'Education'],
              ['/services?category=personal-care', 'Personal Care'],
              ['/services?category=vehicle-services', 'Vehicle Services'],
              ['/services?category=event-services', 'Event Services'],
            ]],
            ['Platform', [
              ['/providers', 'Our Providers'],
              ['/services', 'All Services'],
              ['#', 'Trust Score'],
              ['#', 'AI Smart Match'],
            ]],
            ['Account', [
              ['/login', 'Login'],
              ['/register', 'Register'],
              ['/dashboard', 'Dashboard'],
              ['/my-bookings', 'My Bookings'],
            ]],
          ].map(([title, links]) => (
            <div key={title}>
              <h4 className="font-semibold text-white mb-3 text-sm">{title}</h4>
              <ul className="space-y-2">
                {links.map(([path, label]) => (
                  <li key={label}>
                    <Link to={path} className="text-ink-400 hover:text-saffron-400 text-sm transition-colors">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-ink-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-ink-500 text-sm">© 2026 ServeEase Pro. All rights reserved.</p>
          <p className="text-ink-600 text-xs">Built with 🧡 for Karnataka </p>
        </div>
      </div>
    </footer>
  );
}
