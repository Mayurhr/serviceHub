import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { servicesAPI, categoriesAPI } from '../../utils/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const AdminNav = ({ active }) => (
  <div className="flex gap-2 flex-wrap mb-8">
    {[['Dashboard','/admin'],['Services','/admin/services'],['Providers','/admin/providers'],['Users','/admin/users']].map(([l,p]) => (
      <Link key={p} to={p} className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${active===p?'bg-saffron-500 text-white shadow-md':'bg-white border border-ink-200 text-ink-600 hover:border-saffron-300'}`}>{l}</Link>
    ))}
  </div>
);

const emptyForm = {
  name: '', category: '', shortDescription: '', description: '',
  priceMin: '', priceMax: '', priceUnit: 'fixed', duration: 60,
  includes: '', tags: '', imageUrl: '', isFeatured: false, isPopular: false,
};

// Curated service-specific image suggestions (Unsplash, free to use)
const IMAGE_SUGGESTIONS = {
  'home-services': [
    { label: 'Home Cleaning', url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&auto=format' },
    { label: 'AC Repair', url: 'https://images.unsplash.com/photo-1631545806609-52e5c02c70de?w=600&auto=format' },
    { label: 'Electrician', url: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=600&auto=format' },
    { label: 'Plumbing', url: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=600&auto=format' },
    { label: 'Pest Control', url: 'https://images.unsplash.com/photo-1584473457406-6240486418e9?w=600&auto=format' },
    { label: 'Wall Painting', url: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=600&auto=format' },
    { label: 'Carpentry', url: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=600&auto=format' },
    { label: 'Sofa Cleaning', url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&auto=format' },
  ],
  'tech-services': [
    { label: 'Laptop Repair', url: 'https://images.unsplash.com/photo-1588702547923-7093a6c3ba33?w=600&auto=format' },
    { label: 'Phone Repair', url: 'https://images.unsplash.com/photo-1551808525-51a94da548ce?w=600&auto=format' },
    { label: 'WiFi / Router', url: 'https://images.unsplash.com/photo-1516044734145-07ca8eef8731?w=600&auto=format' },
    { label: 'CCTV Camera', url: 'https://images.unsplash.com/photo-1557597774-9d475d5a937e?w=600&auto=format' },
    { label: 'Computer Setup', url: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&auto=format' },
    { label: 'Smart TV Setup', url: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=600&auto=format' },
  ],
  'education': [
    { label: 'Home Tuition', url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&auto=format' },
    { label: 'Programming', url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format' },
    { label: 'Spoken English', url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&auto=format' },
    { label: 'Math / Science', url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format' },
    { label: 'Music Lessons', url: 'https://images.unsplash.com/photo-1461784121038-f088ca1e7714?w=600&auto=format' },
  ],
  'personal-care': [
    { label: 'Salon at Home', url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&auto=format' },
    { label: 'Fitness Trainer', url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&auto=format' },
    { label: 'Yoga at Home', url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&auto=format' },
    { label: 'Massage / Spa', url: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&auto=format' },
    { label: 'Makeup Artist', url: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600&auto=format' },
  ],
  'vehicle-services': [
    { label: 'Car Wash', url: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=600&auto=format' },
    { label: 'Bike Service', url: 'https://images.unsplash.com/photo-1558980664-769d59546b3d?w=600&auto=format' },
    { label: 'Car Interior', url: 'https://images.unsplash.com/photo-1507136566006-cfc505b114fc?w=600&auto=format' },
    { label: 'Oil Change', url: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600&auto=format' },
  ],
  'event-services': [
    { label: 'Photography', url: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=600&auto=format' },
    { label: 'Event Decor', url: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&auto=format' },
    { label: 'Wedding Setup', url: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&auto=format' },
    { label: 'Birthday Party', url: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=600&auto=format' },
    { label: 'Catering', url: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=600&auto=format' },
  ],
};

export default function AdminServices() {
  const location = useLocation();
  const [services, setServices] = useState([]);
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [imgError, setImgError] = useState(false);
  const [showImgSuggestions, setShowImgSuggestions] = useState(false);

  useEffect(() => {
    Promise.all([servicesAPI.getAll({ limit: 50 }), categoriesAPI.getAll()])
      .then(([s, c]) => { setServices(s.data.services || []); setCats(c.data || []); })
      .catch(() => {}).finally(() => setLoading(false));
  }, []);

  // Auto-open add modal if navigated from dashboard quick action
  useEffect(() => {
    if (location.state?.openAdd) { openAdd(); window.history.replaceState({}, ''); }
  }, [location.state]);

  const openAdd = () => { setEditing(null); setForm(emptyForm); setImgError(false); setShowImgSuggestions(false); setModal(true); };

  const openEdit = s => {
    setEditing(s);
    setForm({
      name: s.name, category: s.category?._id || '',
      shortDescription: s.shortDescription || '', description: s.description,
      priceMin: s.priceRange?.min || '', priceMax: s.priceRange?.max || '',
      priceUnit: s.priceRange?.unit || 'fixed', duration: s.duration,
      includes: (s.includes || []).join('\n'),
      tags: (s.tags || []).join(', '),
      imageUrl: s.images?.[0] || '',
      isFeatured: s.isFeatured || false, isPopular: s.isPopular || false,
    });
    setImgError(false);
    setModal(true);
  };

  const save = async e => {
    e.preventDefault();
    if (!form.name || !form.category || !form.priceMin) return toast.error('Name, category and price are required');
    setSaving(true);
    try {
      const ts = ['08:00 AM','09:00 AM','10:00 AM','11:00 AM','12:00 PM','01:00 PM','02:00 PM','03:00 PM','04:00 PM','05:00 PM','06:00 PM','07:00 PM'].map(t => ({ time: t, available: true }));
      const payload = {
        name: form.name, category: form.category,
        shortDescription: form.shortDescription, description: form.description,
        priceRange: { min: Number(form.priceMin), max: Number(form.priceMax) || undefined, unit: form.priceUnit },
        duration: Number(form.duration),
        includes: form.includes.split('\n').map(s => s.trim()).filter(Boolean),
        tags: form.tags.split(',').map(s => s.trim()).filter(Boolean),
        images: form.imageUrl.trim() ? [form.imageUrl.trim()] : [],
        isFeatured: form.isFeatured, isPopular: form.isPopular, timeSlots: ts,
      };
      if (editing) {
        const r = await servicesAPI.update(editing._id, payload);
        setServices(prev => prev.map(s => s._id === editing._id ? { ...r.data, category: cats.find(c => c._id === form.category) || s.category } : s));
        toast.success('Service updated!');
      } else {
        const r = await servicesAPI.create(payload);
        // Re-fetch to get populated category
        const fresh = await servicesAPI.getAll({ limit: 50 });
        setServices(fresh.data.services || []);
        toast.success('Service created successfully!');
      }
      setModal(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save service'); }
    finally { setSaving(false); }
  };

  const del = async id => {
    if (!confirm('Delete this service? This cannot be undone.')) return;
    try { await servicesAPI.delete(id); setServices(prev => prev.filter(s => s._id !== id)); toast.success('Service deleted'); }
    catch { toast.error('Failed to delete'); }
  };

  const filtered = services.filter(s => !search || s.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="page-container py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-ink-900">Manage Services</h1>
          <p className="text-ink-500 mt-1">{services.length} active services</p>
        </div>
        <button onClick={openAdd} className="btn-primary">+ Add New Service</button>
      </div>
      <AdminNav active="/admin/services" />

      <div className="mb-5">
        <input type="text" className="input-field max-w-sm" placeholder="🔍 Search services..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? <LoadingSpinner fullPage /> : (
        <div className="card-flat overflow-hidden">
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">🛠️</div>
              <h3 className="text-lg font-bold text-ink-900 mb-2">No services yet</h3>
              <p className="text-ink-500 mb-5">Add your first service to get started.</p>
              <button onClick={openAdd} className="btn-primary">+ Add First Service</button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-ink-50 border-b border-ink-100">
                  <tr>
                    {['Service', 'Category', 'Price', 'Rating', 'Bookings', 'Actions'].map(h => (
                      <th key={h} className="text-left py-3 px-4 text-xs font-bold text-ink-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-50">
                  {filtered.map(s => (
                    <tr key={s._id} className="hover:bg-ink-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={s.images?.[0] || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=80'}
                            alt={s.name}
                            className="w-12 h-12 rounded-xl object-cover bg-ink-100 shrink-0"
                            onError={e => { e.target.src = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=80'; }}
                          />
                          <div>
                            <p className="font-semibold text-ink-800 line-clamp-1">{s.name}</p>
                            <div className="flex gap-1 mt-0.5 flex-wrap">
                              {s.isFeatured && <span className="badge bg-saffron-100 text-saffron-700 text-[9px]">⭐ Featured</span>}
                              {s.isPopular && <span className="badge bg-violet-100 text-violet-700 text-[9px]">🔥 Popular</span>}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-xs text-ink-600">{s.category?.emoji} {s.category?.name}</td>
                      <td className="py-3 px-4 font-bold text-saffron-500">
                        ₹{s.priceRange?.min?.toLocaleString()}
                        {s.priceRange?.unit === 'hourly' ? '/hr' : s.priceRange?.unit === 'per_plate' ? '/plate' : ''}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <span className="text-amber-500">★</span> {s.rating}
                        <span className="text-ink-400 text-xs"> ({s.numReviews})</span>
                      </td>
                      <td className="py-3 px-4 text-ink-600">{s.totalBookings?.toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <div className="flex gap-1">
                          <button onClick={() => openEdit(s)} className="text-xs bg-saffron-50 text-saffron-600 hover:bg-saffron-100 px-2.5 py-1.5 rounded-lg font-semibold transition-colors">Edit</button>
                          <button onClick={() => del(s._id)} className="text-xs bg-red-50 text-red-600 hover:bg-red-100 px-2.5 py-1.5 rounded-lg font-semibold transition-colors">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto animate-scale-in">
            <div className="sticky top-0 bg-white border-b border-ink-100 p-5 flex items-center justify-between rounded-t-3xl z-10">
              <h2 className="font-extrabold text-xl text-ink-900">{editing ? 'Edit Service' : 'Add New Service'}</h2>
              <button onClick={() => setModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-ink-100 text-ink-500 text-lg">✕</button>
            </div>
            <form onSubmit={save} className="p-6 space-y-4">
              {/* Image */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-bold text-ink-700">Service Image</label>
                  <button
                    type="button"
                    onClick={() => setShowImgSuggestions(p => !p)}
                    className="text-xs font-semibold text-saffron-600 bg-saffron-50 hover:bg-saffron-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    🖼️ {showImgSuggestions ? 'Hide Suggestions' : 'Pick from Suggestions'}
                  </button>
                </div>

                {/* Image suggestion grid — shows based on selected category */}
                {showImgSuggestions && (() => {
                  const catSlug = cats.find(c => c._id === form.category)?.slug || '';
                  const suggestions = IMAGE_SUGGESTIONS[catSlug] || Object.values(IMAGE_SUGGESTIONS).flat();
                  return (
                    <div className="mb-3 p-3 bg-ink-50 rounded-2xl border border-ink-100">
                      <p className="text-xs font-semibold text-ink-500 mb-2">
                        {catSlug ? `Suggestions for ${cats.find(c => c._id === form.category)?.name}` : 'All suggestions (select a category to filter)'}
                      </p>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {suggestions.map((img, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => { setForm(p => ({ ...p, imageUrl: img.url })); setImgError(false); setShowImgSuggestions(false); }}
                            className={`group relative rounded-xl overflow-hidden border-2 transition-all ${form.imageUrl === img.url ? 'border-saffron-500 ring-2 ring-saffron-200' : 'border-transparent hover:border-saffron-300'}`}
                          >
                            <img src={img.url} alt={img.label} className="w-full h-16 object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
                              <span className="text-white text-[10px] font-bold p-1 leading-tight">{img.label}</span>
                            </div>
                            {form.imageUrl === img.url && (
                              <div className="absolute top-1 right-1 bg-saffron-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">✓</div>
                            )}
                          </button>
                        ))}
                      </div>
                      <p className="text-[11px] text-ink-400 mt-2">Click any image to select it, or paste your own URL below.</p>
                    </div>
                  );
                })()}

                <input type="url" className="input-field text-sm py-2.5"
                  placeholder="https://images.unsplash.com/photo-...?w=600"
                  value={form.imageUrl}
                  onChange={e => { setForm(p => ({ ...p, imageUrl: e.target.value })); setImgError(false); }} />
                {form.imageUrl && !imgError && (
                  <div className="mt-2">
                    <img src={form.imageUrl} alt="Preview"
                      className="w-full h-36 object-cover rounded-xl border border-ink-200"
                      onError={() => setImgError(true)} />
                  </div>
                )}
                {imgError && <p className="text-xs text-red-500 mt-1">⚠️ Could not load image — please check the URL.</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-bold text-ink-700 mb-1.5">Service Name *</label>
                  <input className="input-field text-sm py-2.5" required placeholder="e.g. Deep Home Cleaning"
                    value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-ink-700 mb-1.5">Category *</label>
                  <select className="input-field text-sm py-2.5" required
                    value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                    <option value="">Select a category</option>
                    {cats.map(c => <option key={c._id} value={c._id}>{c.emoji} {c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-ink-700 mb-1.5">Duration (minutes)</label>
                  <input type="number" className="input-field text-sm py-2.5" min="15"
                    value={form.duration} onChange={e => setForm(p => ({ ...p, duration: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-ink-700 mb-1.5">Starting Price ₹ *</label>
                  <input type="number" className="input-field text-sm py-2.5" required min="0" placeholder="299"
                    value={form.priceMin} onChange={e => setForm(p => ({ ...p, priceMin: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-ink-700 mb-1.5">Max Price ₹ (optional)</label>
                  <input type="number" className="input-field text-sm py-2.5" min="0" placeholder="999"
                    value={form.priceMax} onChange={e => setForm(p => ({ ...p, priceMax: e.target.value }))} />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-bold text-ink-700 mb-1.5">Price Type</label>
                  <select className="input-field text-sm py-2.5"
                    value={form.priceUnit} onChange={e => setForm(p => ({ ...p, priceUnit: e.target.value }))}>
                    <option value="fixed">Fixed Price</option>
                    <option value="starting">Starting From</option>
                    <option value="hourly">Per Hour</option>
                    <option value="per_plate">Per Plate</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-bold text-ink-700 mb-1.5">Short Description</label>
                  <input className="input-field text-sm py-2.5" placeholder="Brief tagline shown on cards"
                    value={form.shortDescription} onChange={e => setForm(p => ({ ...p, shortDescription: e.target.value }))} />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-bold text-ink-700 mb-1.5">Full Description *</label>
                  <textarea rows={3} className="input-field text-sm py-2.5 resize-none" required
                    placeholder="Detailed description of what this service includes..."
                    value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-bold text-ink-700 mb-1.5">What's Included (one per line)</label>
                  <textarea rows={3} className="input-field text-sm py-2.5 resize-none"
                    placeholder={'Free inspection\nAll tools included\nWarranty on work'}
                    value={form.includes} onChange={e => setForm(p => ({ ...p, includes: e.target.value }))} />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-bold text-ink-700 mb-1.5">Tags (comma separated)</label>
                  <input className="input-field text-sm py-2.5" placeholder="cleaning, home, sanitization"
                    value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} />
                </div>
                <div className="sm:col-span-2 flex gap-6">
                  {[['isFeatured', '⭐ Mark as Featured'], ['isPopular', '🔥 Mark as Popular']].map(([k, l]) => (
                    <label key={k} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="accent-saffron-500 w-4 h-4"
                        checked={form[k]} onChange={e => setForm(p => ({ ...p, [k]: e.target.checked }))} />
                      <span className="text-sm font-medium text-ink-700">{l}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1 py-3">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 py-3 disabled:opacity-60">
                  {saving ? 'Saving...' : editing ? 'Update Service' : 'Create Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
