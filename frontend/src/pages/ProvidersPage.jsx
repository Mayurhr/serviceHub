import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { providersAPI, ALLOWED_CITIES } from '../utils/api';
import ProviderCard from '../components/common/ProviderCard';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function ProvidersPage() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ city: '', available: '' });
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const cityParam = searchParams.get('city');
    if (cityParam && ALLOWED_CITIES.includes(cityParam)) {
      setFilters(prev => ({ ...prev, city: cityParam }));
    }
  }, [searchParams]);

  useEffect(() => {
    setLoading(true);
    const params = { limit: 30 };
    if (filters.available) params.available = filters.available;
    if (filters.city) params.city = filters.city;
    providersAPI.getAll(params)
      .then(r => setProviders(r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filters]);

  const filtered = providers.filter(p =>
    !search ||
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.skills?.some(s => s.toLowerCase().includes(search.toLowerCase()))
  );

  const statusDot = { online: 'bg-green-500', busy: 'bg-amber-500', offline: 'bg-ink-400' };

  return (
    <div className="page-container py-8 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-ink-900">Our Providers</h1>
        <p className="text-ink-500 mt-1">{filtered.length} verified experts in {ALLOWED_CITIES.join(', ')}</p>
      </div>

      {/* Filters */}
      <div className="card-flat p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400">🔍</span>
            <input type="text" placeholder="Search by name or skill..."
              className="input-field pl-9 py-2.5 text-sm" value={search}
              onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="input-field py-2.5 text-sm w-full sm:w-44" value={filters.city}
            onChange={e => setFilters(p => ({ ...p, city: e.target.value }))}>
            <option value="">All Cities</option>
            {ALLOWED_CITIES.map(c => <option key={c} value={c}>📍 {c}</option>)}
          </select>
          <select className="input-field py-2.5 text-sm w-full sm:w-40" value={filters.available}
            onChange={e => setFilters(p => ({ ...p, available: e.target.value }))}>
            <option value="">All Status</option>
            <option value="online">🟢 Online</option>
            <option value="busy">🟡 Busy</option>
            <option value="offline">⚫ Offline</option>
          </select>
          <button onClick={() => { setFilters({ city: '', available: '' }); setSearch(''); }}
            className="btn-secondary py-2.5 text-sm whitespace-nowrap">Clear</button>
        </div>
      </div>

      {/* City quick-filter chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button onClick={() => setFilters(p => ({ ...p, city: '' }))}
          className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${!filters.city ? 'bg-saffron-500 text-white border-saffron-500' : 'bg-white text-ink-600 border-ink-200 hover:border-saffron-300'}`}>
          All Cities
        </button>
        {ALLOWED_CITIES.map(city => (
          <button key={city} onClick={() => setFilters(p => ({ ...p, city }))}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${filters.city === city ? 'bg-saffron-500 text-white border-saffron-500' : 'bg-white text-ink-600 border-ink-200 hover:border-saffron-300'}`}>
            📍 {city}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-6">
        {[
          ['🟢 Online — Available now', 'bg-green-50 text-green-700'],
          ['🟡 Busy — Limited slots', 'bg-amber-50 text-amber-700'],
          ['⚫ Offline', 'bg-ink-100 text-ink-500'],
          ['✓ Verified', 'bg-violet-50 text-violet-700'],
          ['🎓 Student / Local Talent', 'bg-blue-50 text-blue-700'],
        ].map(([label, cls]) => (
          <span key={label} className={`${cls} text-xs font-semibold px-3 py-1 rounded-full`}>{label}</span>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner fullPage text="Loading providers..." />
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="text-xl font-bold text-ink-900 mb-2">No providers found</h3>
          <p className="text-ink-500 mb-4">Try a different city or availability filter</p>
          <button onClick={() => { setFilters({ city: '', available: '' }); setSearch(''); }}
            className="btn-primary">Clear Filters</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filtered.map(p => <ProviderCard key={p._id} provider={p} />)}
        </div>
      )}
    </div>
  );
}
