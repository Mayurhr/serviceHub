import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { servicesAPI, categoriesAPI } from '../utils/api';
import ServiceCard from '../components/common/ServiceCard';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    sort: '', minPrice: '', maxPrice: '',
    featured: searchParams.get('featured') || '',
  });

  useEffect(() => { categoriesAPI.getAll().then(r => setCats(r.data)).catch(() => {}); }, []);

  useEffect(() => {
    setLoading(true);
    const p = { page, limit: 9, ...Object.fromEntries(Object.entries(filters).filter(([,v]) => v)) };
    servicesAPI.getAll(p).then(r => { setServices(r.data.services || []); setTotal(r.data.total || 0); })
      .catch(() => {}).finally(() => setLoading(false));
  }, [filters, page]);

  const set = (k, v) => { setFilters(prev => ({...prev, [k]: v})); setPage(1); };
  const clear = () => { setFilters({ search:'', category:'', sort:'', minPrice:'', maxPrice:'', featured:'' }); setPage(1); };
  const pages = Math.ceil(total / 9);

  return (
    <div className="page-container py-8 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-ink-900">All Services</h1>
        <p className="text-ink-500 mt-1">{total} services available in Multiple Cities Across Karnataka</p>
      </div>
      <div className="flex flex-col lg:flex-row gap-6">
        <aside className="lg:w-60 shrink-0">
          <div className="card-flat p-5 sticky top-24">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-ink-900">Filters</h3>
              <button onClick={clear} className="text-xs text-saffron-500 hover:underline font-semibold">Clear all</button>
            </div>
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-ink-600 mb-2 uppercase tracking-wide">Search</label>
                <input type="text" className="input-field text-sm py-2" placeholder="Search..." value={filters.search} onChange={e => set('search', e.target.value)}/>
              </div>
              <div>
                <label className="block text-xs font-bold text-ink-600 mb-2 uppercase tracking-wide">Category</label>
                <div className="space-y-1">
                  <button onClick={() => set('category','')} className={`w-full text-left text-sm px-3 py-2 rounded-xl transition-colors ${!filters.category ? 'bg-saffron-500 text-white' : 'hover:bg-ink-50 text-ink-700'}`}>All</button>
                  {cats.map(c => (
                    <button key={c._id} onClick={() => set('category',c.slug)} className={`w-full text-left text-sm px-3 py-2 rounded-xl transition-colors flex items-center gap-2 ${filters.category===c.slug ? 'bg-saffron-500 text-white' : 'hover:bg-ink-50 text-ink-700'}`}>
                      <span>{c.emoji}</span>{c.name}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-ink-600 mb-2 uppercase tracking-wide">Sort By</label>
                <select className="input-field text-sm py-2" value={filters.sort} onChange={e => set('sort',e.target.value)}>
                  <option value="">Latest</option>
                  <option value="rating">Top Rated</option>
                  <option value="popular">Most Popular</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-ink-600 mb-2 uppercase tracking-wide">Price Range (₹)</label>
                <div className="flex gap-2">
                  <input type="number" className="input-field text-sm py-2" placeholder="Min" value={filters.minPrice} onChange={e => set('minPrice',e.target.value)}/>
                  <input type="number" className="input-field text-sm py-2" placeholder="Max" value={filters.maxPrice} onChange={e => set('maxPrice',e.target.value)}/>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="feat" className="accent-saffron-500" checked={filters.featured==='true'} onChange={e => set('featured', e.target.checked ? 'true' : '')}/>
                <label htmlFor="feat" className="text-sm font-medium text-ink-700 cursor-pointer">Featured only</label>
              </div>
            </div>
          </div>
        </aside>

        <div className="flex-1">
          {loading ? <div className="flex justify-center py-20"><LoadingSpinner size="lg" text="Loading services..."/></div>
           : services.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-ink-900 mb-2">No services found</h3>
              <button onClick={clear} className="btn-primary mt-4">Clear Filters</button>
            </div>
           ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 mb-8">
                {services.map(s => <ServiceCard key={s._id} service={s}/>)}
              </div>
              {pages > 1 && (
                <div className="flex items-center justify-center gap-3">
                  <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1} className="btn-secondary py-2 px-4 text-sm disabled:opacity-40">← Prev</button>
                  <span className="text-sm text-ink-600 font-medium">Page {page} of {pages}</span>
                  <button onClick={() => setPage(p => p+1)} disabled={page>=pages} className="btn-secondary py-2 px-4 text-sm disabled:opacity-40">Next →</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
