import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { categoriesAPI, servicesAPI, providersAPI, publicStatsAPI, ALLOWED_CITIES } from '../utils/api';
import ServiceCard from '../components/common/ServiceCard';
import ProviderCard from '../components/common/ProviderCard';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function HomePage() {
  const [cats, setCats] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [topProviders, setTopProviders] = useState([]);
  const [platformStats, setPlatformStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch each independently so a single failure doesn't block others
    const fetchData = async () => {
      setLoading(true);
      try {
        const [catsRes, featuredRes, providersRes, statsRes] = await Promise.allSettled([
          categoriesAPI.getAll(),
          servicesAPI.getAll({ featured: 'true', limit: 6 }),
          providersAPI.getAll({ limit: 4, available: 'online' }),
          publicStatsAPI.getStats(),
        ]);
        if (catsRes.status === 'fulfilled') setCats(catsRes.value.data || []);
        if (featuredRes.status === 'fulfilled') setFeatured(featuredRes.value.data?.services || []);
        if (providersRes.status === 'fulfilled') setTopProviders(providersRes.value.data || []);
        if (statsRes.status === 'fulfilled') setPlatformStats(statsRes.value.data);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const features = [
    { icon: '🤖', title: 'AI Smart Match', desc: 'Finds the best provider for your budget and location using our smart ranking algorithm.' },
    { icon: '🔒', title: 'Trust Score', desc: 'Every provider has a dynamic trust score based on ratings, job success and reliability.' },
    { icon: '📦', title: 'Bundle Booking', desc: 'Book multiple services together and get automatic discounts up to 15%.' },
    { icon: '💬', title: 'Problem Help Mode', desc: 'Chat or call a provider directly for free consultation before booking.' },
    { icon: '🧾', title: 'Auto Invoice', desc: 'A clean, accurate invoice generated automatically after service completion.' },
    { icon: '✓', title: 'Verified Experts', desc: 'All providers are manually verified and rated by real customers.' },
  ];

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative bg-ink-900 text-white overflow-hidden min-h-[540px] flex items-center">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/3 w-96 h-96 bg-saffron-500/15 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-violet-500/15 rounded-full blur-3xl" />
          <div className="absolute inset-0 opacity-5"
            style={{ backgroundImage: 'radial-gradient(circle,#fff 1px,transparent 1px)', backgroundSize: '24px 24px' }} />
        </div>
        <div className="relative page-container py-20 w-full">
          <div className="max-w-2xl animate-slide-up">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full text-sm font-medium mb-6 border border-white/20">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Serving: {ALLOWED_CITIES.join(' · ')}
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
              Book Local Services<br />
              <span className="text-gradient-saffron">Right at Your Door</span>
            </h1>
            <p className="text-ink-300 text-lg mb-8 leading-relaxed">
              Find and book verified local experts for home repairs, tech help, education, beauty and more.
            </p>
            <form
              onSubmit={e => { e.preventDefault(); if (search.trim()) navigate(`/services?search=${encodeURIComponent(search)}`); }}
              className="flex gap-3 max-w-lg">
              <div className="flex-1 relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400">🔍</span>
                <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search e.g. plumber, tutor, yoga..."
                  className="w-full pl-11 pr-4 py-4 rounded-2xl bg-white text-ink-800 placeholder-ink-400 outline-none focus:ring-2 focus:ring-saffron-300 text-base shadow-xl font-medium" />
              </div>
              <button type="submit" className="btn-primary px-8 py-4 rounded-2xl text-base shadow-xl whitespace-nowrap">
                Search
              </button>
            </form>
            <div className="flex flex-wrap gap-2 mt-5">
              {['Cleaning', 'AC Repair', 'Laptop Repair', 'Yoga', 'Photography', 'Catering'].map(t => (
                <button key={t} onClick={() => navigate(`/services?search=${t}`)}
                  className="bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-medium px-3 py-1.5 rounded-full transition-colors">
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-10 bg-ink-50"
          style={{ clipPath: 'ellipse(55% 100% at 50% 100%)' }} />
      </section>

      {/* Real platform stats */}
      {platformStats && (
        <section className="page-container -mt-2 mb-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { l: 'Registered Users', v: platformStats.users, i: '👥' },
              { l: 'Active Services', v: platformStats.services, i: '🛠️' },
              { l: 'Expert Providers', v: platformStats.providers, i: '⭐' },
              { l: 'Total Bookings', v: platformStats.bookings, i: '📅' },
            ].map((s, i) => (
              <div key={i} className="card-flat p-5 text-center hover:border-saffron-200 transition-colors">
                <div className="text-3xl mb-2">{s.i}</div>
                <div className="text-2xl font-extrabold text-ink-900">{s.v}</div>
                <div className="text-ink-500 text-xs mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Categories */}
      <section className="page-container mb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="section-title">Browse Categories</h2>
            <p className="text-ink-500 mt-1">Find the service that fits your need</p>
          </div>
          <Link to="/services" className="text-saffron-500 font-semibold text-sm hover:text-saffron-600">All services →</Link>
        </div>
        {loading ? (
          <div className="flex justify-center py-10"><LoadingSpinner /></div>
        ) : cats.length === 0 ? (
          <div className="text-center py-10 text-ink-400">No categories found. Run the database seeder first.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {cats.map(c => (
              <Link key={c._id} to={`/services?category=${c.slug}`}
                className="group flex flex-col items-center gap-3 p-5 bg-white rounded-2xl border border-ink-100 hover:border-saffron-200 transition-all duration-300 hover:-translate-y-1"
                style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300"
                  style={{ background: `linear-gradient(135deg,${c.gradientFrom}20,${c.gradientTo}30)`, border: `1px solid ${c.color}30` }}>
                  {c.emoji}
                </div>
                <span className="text-xs font-bold text-ink-700 text-center group-hover:text-saffron-500 transition-colors leading-tight">
                  {c.name}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Featured Services */}
      <section className="page-container mb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="section-title">Featured Services</h2>
            <p className="text-ink-500 mt-1">Top-rated services in your area</p>
          </div>
          <Link to="/services?featured=true" className="text-saffron-500 font-semibold text-sm hover:text-saffron-600">
            View all →
          </Link>
        </div>
        {loading ? (
          <div className="flex justify-center py-10"><LoadingSpinner /></div>
        ) : featured.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-ink-400 mb-4">No featured services found.</p>
            <Link to="/services" className="btn-primary text-sm py-2">Browse All Services</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featured.map(s => <ServiceCard key={s._id} service={s} />)}
          </div>
        )}
      </section>

      {/* Top Providers */}
      <section className="bg-gradient-to-br from-saffron-50 to-violet-50 py-16 mb-16">
        <div className="page-container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="section-title">Available Providers</h2>
              <p className="text-ink-500 mt-1">Verified experts online now</p>
            </div>
            <Link to="/providers" className="text-saffron-500 font-semibold text-sm hover:text-saffron-600">
              All providers →
            </Link>
          </div>
          {loading ? (
            <div className="flex justify-center py-10"><LoadingSpinner /></div>
          ) : topProviders.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-ink-400 mb-4">No providers online right now.</p>
              <Link to="/providers" className="btn-secondary text-sm py-2">View All Providers</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {topProviders.map(p => <ProviderCard key={p._id} provider={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* City coverage */}
      <section className="page-container mb-16">
        <div className="card-flat p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="text-5xl">📍</div>
            <div className="flex-1">
              <h3 className="font-extrabold text-xl text-ink-900 mb-1">Cities We Currently Serve</h3>
              <p className="text-ink-500 text-sm mb-3">Book services from verified local professionals in your area</p>
              <div className="flex flex-wrap gap-2">
                {ALLOWED_CITIES.map(city => (
                  <Link key={city} to={`/providers?city=${city}`}
                    className="bg-saffron-50 border border-saffron-200 text-saffron-700 text-sm font-semibold px-4 py-2 rounded-xl hover:bg-saffron-100 transition-colors">
                    📍 {city}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="page-container mb-16">
        <div className="text-center mb-10">
          <h2 className="section-title">Why ServeEase Pro?</h2>
          <p className="text-ink-500 mt-2 max-w-xl mx-auto">
            Intelligent features that make booking services seamless and safe.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <div key={i} className="card-flat p-6 hover:border-saffron-200 transition-colors">
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="font-bold text-ink-900 mb-2">{f.title}</h3>
              <p className="text-ink-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>


      {/* Helpline / Contact Section */}
      <section className="page-container mb-16">
        <div className="bg-gradient-to-br from-ink-900 to-ink-800 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-0 w-64 h-64 bg-saffron-500/10 rounded-full -translate-y-1/2 translate-x-1/2"/>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-violet-500/10 rounded-full translate-y-1/2 -translate-x-1/2"/>
          </div>
          <div className="relative">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-saffron-500/20 border border-saffron-400/30 text-saffron-300 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                <span className="w-2 h-2 bg-saffron-400 rounded-full animate-pulse"/>
                24/7 Customer Support
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold mb-3">Need Help? We Are Here for You</h2>
              <p className="text-ink-300 text-base max-w-xl mx-auto">Our dedicated support team is available round the clock to assist you with bookings, complaints, or any queries.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: '📞', label: 'Customer Support', value: '+91 9900 123 456', sub: 'Available 24/7', href: 'tel:+919900123456', cta: 'Call Now' },
                { icon: '📧', label: 'Email Support', value: 'support@servease.com', sub: 'Reply within 2 hours', href: 'mailto:support@servease.com', cta: 'Send Email' },
                { icon: '🕐', label: 'Working Hours', value: 'Mon – Sun', sub: '8:00 AM – 8:00 PM', href: null, cta: null },
                { icon: '🚨', label: 'Emergency Line', value: '+91 9900 999 000', sub: 'Urgent help only', href: 'tel:+919900999000', cta: 'Emergency Call' },
              ].map((item, i) => (
                <div key={i} className="bg-white/10 backdrop-blur rounded-2xl p-5 border border-white/10 hover:bg-white/15 transition-all">
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <p className="text-ink-300 text-xs font-semibold uppercase tracking-wide mb-1">{item.label}</p>
                  <p className="font-bold text-white text-base mb-0.5">{item.value}</p>
                  <p className="text-ink-400 text-xs mb-3">{item.sub}</p>
                  {item.href && (
                    <a href={item.href} className="inline-flex items-center gap-1.5 bg-saffron-500 hover:bg-saffron-600 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors">
                      {item.cta}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="page-container mb-16">
        <div className="bg-saffron-gradient rounded-3xl p-10 md:p-16 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
          </div>
          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Ready to Get Started?</h2>
            <p className="text-saffron-100 text-lg mb-8 max-w-xl mx-auto">
              Book your first service today from verified local professionals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="bg-white text-saffron-600 font-bold px-8 py-4 rounded-2xl hover:bg-saffron-50 transition-colors shadow-lg">
                Create Free Account
              </Link>
              <Link to="/services" className="bg-white/20 hover:bg-white/30 border border-white/30 text-white font-bold px-8 py-4 rounded-2xl transition-colors">
                Browse Services
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
