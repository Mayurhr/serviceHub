import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { providersAPI, categoriesAPI, ALLOWED_CITIES } from '../../utils/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import TrustScore from '../../components/common/TrustScore';
import toast from 'react-hot-toast';

const AdminNav = ({ active }) => (
  <div className="flex gap-2 flex-wrap mb-8">
    {[['📊 Dashboard','/admin'],['🛠️ Services','/admin/services'],['👥 Providers','/admin/providers'],['📅 Bookings','/admin/bookings'],['👤 Users','/admin/users']].map(([l,p]) => (
      <Link key={p} to={p} className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${active===p?'bg-saffron-500 text-white shadow-md':'bg-white border border-ink-200 text-ink-600 hover:border-saffron-300'}`}>{l}</Link>
    ))}
  </div>
);

const emptyForm = {
  name: '', email: '', phone: '', password: 'provider123', bio: '',
  experience: 1, city: 'Davanagere', skills: '',
  availabilityStatus: 'online', isVerified: false, isStudent: false, isFeatured: false,
};

export default function AdminProviders() {
  const location = useLocation();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('');

  useEffect(() => {
    providersAPI.getAll({ limit: 50 })
      .then(r => setProviders(r.data || []))
      .catch(() => {}).finally(() => setLoading(false));
  }, []);

  // Auto-open add modal from dashboard
  useEffect(() => {
    if (location.state?.openAdd) { openAdd(); window.history.replaceState({}, ''); }
  }, [location.state]);

  const openAdd = () => { setEditing(null); setForm(emptyForm); setModal(true); };

  const openEdit = p => {
    setEditing(p);
    setForm({
      name: p.name, email: p.email, phone: p.phone, password: '',
      bio: p.bio || '', experience: p.experience,
      city: p.city || 'Davanagere',
      skills: (p.skills || []).join(', '),
      availabilityStatus: p.availabilityStatus,
      isVerified: p.isVerified, isStudent: p.isStudent, isFeatured: p.isFeatured,
    });
    setModal(true);
  };

  const save = async e => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone) return toast.error('Name, email and phone are required');
    if (!editing && !form.password) return toast.error('Password is required for new providers');
    setSaving(true);
    try {
      const payload = { ...form, skills: form.skills.split(',').map(s => s.trim()).filter(Boolean) };
      if (!payload.password) delete payload.password;
      if (editing) {
        await providersAPI.update(editing._id, payload);
        setProviders(prev => prev.map(p => p._id === editing._id ? { ...p, ...payload } : p));
        toast.success('Provider updated!');
      } else {
        const r = await providersAPI.create(payload);
        setProviders(prev => [r.data, ...prev]);
        toast.success('Provider added successfully!');
      }
      setModal(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save provider'); }
    finally { setSaving(false); }
  };

  const del = async id => {
    if (!confirm('Delete this provider? This cannot be undone.')) return;
    try { await providersAPI.delete(id); setProviders(prev => prev.filter(p => p._id !== id)); toast.success('Provider deleted'); }
    catch { toast.error('Failed to delete'); }
  };

  const toggleAvail = async (id, status) => {
    try {
      await providersAPI.updateAvailability(id, { status });
      setProviders(prev => prev.map(p => p._id === id ? { ...p, availabilityStatus: status } : p));
    } catch { toast.error('Failed to update availability'); }
  };

  const filtered = providers.filter(p =>
    (!search || p.name.toLowerCase().includes(search.toLowerCase()) || p.skills?.some(s => s.toLowerCase().includes(search.toLowerCase()))) &&
    (!cityFilter || p.city === cityFilter)
  );

  const statusDot = { online: 'bg-green-500', busy: 'bg-amber-500', offline: 'bg-ink-400' };

  return (
    <div className="page-container py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-ink-900">Manage Providers</h1>
          <p className="text-ink-500 mt-1">{providers.length} providers registered</p>
        </div>
        <button onClick={openAdd} className="btn-primary">+ Add New Provider</button>
      </div>
      <AdminNav active="/admin/providers" />

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <input type="text" className="input-field max-w-sm" placeholder="🔍 Search by name or skill..."
          value={search} onChange={e => setSearch(e.target.value)} />
        <select className="input-field w-full sm:w-44" value={cityFilter} onChange={e => setCityFilter(e.target.value)}>
          <option value="">All Cities</option>
          {ALLOWED_CITIES.map(c => <option key={c} value={c}>📍 {c}</option>)}
        </select>
      </div>

      {loading ? <LoadingSpinner fullPage /> : (
        <div className="card-flat overflow-hidden">
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">👥</div>
              <h3 className="text-lg font-bold text-ink-900 mb-2">No providers yet</h3>
              <p className="text-ink-500 mb-5">Add your first provider to get started.</p>
              <button onClick={openAdd} className="btn-primary">+ Add First Provider</button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-ink-50 border-b border-ink-100">
                  <tr>
                    {['Provider', 'Phone', 'City', 'Trust', 'Rating', 'Availability', 'Actions'].map(h => (
                      <th key={h} className="text-left py-3 px-4 text-xs font-bold text-ink-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-50">
                  {filtered.map(p => (
                    <tr key={p._id} className="hover:bg-ink-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="relative shrink-0">
                            <img src={p.avatar || `https://i.pravatar.cc/36?u=${p._id}`}
                              className="w-9 h-9 rounded-xl object-cover"
                              onError={e => { e.target.src = `https://i.pravatar.cc/36?u=${p._id}`; }} />
                            <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${statusDot[p.availabilityStatus]} rounded-full border border-white`} />
                          </div>
                          <div>
                            <p className="font-semibold text-ink-800 text-sm">{p.name}</p>
                            <div className="flex gap-1">
                              {p.isVerified && <span className="badge badge-verified text-[9px]">✓</span>}
                              {p.isStudent && <span className="badge badge-student text-[9px]">🎓</span>}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-ink-600 text-xs font-mono">{p.phone}</td>
                      <td className="py-3 px-4 text-ink-600 text-xs font-semibold">📍 {p.city}</td>
                      <td className="py-3 px-4"><TrustScore score={p.trustScore} showLabel={false} /></td>
                      <td className="py-3 px-4 text-sm">
                        <span className="text-amber-500">★</span> {p.rating}
                        <span className="text-ink-400 text-xs"> ({p.numReviews})</span>
                      </td>
                      <td className="py-3 px-4">
                        <select value={p.availabilityStatus}
                          onChange={e => toggleAvail(p._id, e.target.value)}
                          className="text-xs border border-ink-200 rounded-lg px-2 py-1.5 outline-none focus:border-saffron-400 cursor-pointer">
                          <option value="online">🟢 Online</option>
                          <option value="busy">🟡 Busy</option>
                          <option value="offline">⚫ Offline</option>
                        </select>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-1">
                          <button onClick={() => openEdit(p)} className="text-xs bg-saffron-50 text-saffron-600 hover:bg-saffron-100 px-2.5 py-1.5 rounded-lg font-semibold transition-colors">Edit</button>
                          <button onClick={() => del(p._id)} className="text-xs bg-red-50 text-red-600 hover:bg-red-100 px-2.5 py-1.5 rounded-lg font-semibold transition-colors">Del</button>
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

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="sticky top-0 bg-white border-b border-ink-100 p-5 flex items-center justify-between rounded-t-3xl z-10">
              <h2 className="font-extrabold text-xl text-ink-900">{editing ? 'Edit Provider' : 'Add New Provider'}</h2>
              <button onClick={() => setModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-ink-100 text-ink-500 text-lg">✕</button>
            </div>
            <form onSubmit={save} className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                ['Full Name *', 'text', 'name', true],
                ['Email *', 'email', 'email', true],
                ['Phone *', 'tel', 'phone', true],
               
                ['Experience (years)', 'number', 'experience', false],
              ].map(([l, t, k, req]) => (
                <div key={k}>
                  <label className="block text-sm font-bold text-ink-700 mb-1.5">{l}</label>
                  <input type={t} className="input-field text-sm py-2.5" required={req}
                    placeholder={editing && k === 'password' ? 'Leave blank to keep current' : ''}
                    value={form[k]} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))} />
                </div>
              ))}
              <div>
                <label className="block text-sm font-bold text-ink-700 mb-1.5">City *</label>
                <select className="input-field text-sm py-2.5" required
                  value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))}>
                  {ALLOWED_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-bold text-ink-700 mb-1.5">Bio</label>
                <textarea rows={2} className="input-field text-sm py-2.5 resize-none"
                  placeholder="Professional background and area of expertise..."
                  value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-bold text-ink-700 mb-1.5">Skills (comma separated)</label>
                <input type="text" className="input-field text-sm py-2.5"
                  placeholder="Plumbing, Pipe Fitting, Drain Cleaning"
                  value={form.skills} onChange={e => setForm(p => ({ ...p, skills: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-bold text-ink-700 mb-1.5">Availability Status</label>
                <select className="input-field text-sm py-2.5"
                  value={form.availabilityStatus} onChange={e => setForm(p => ({ ...p, availabilityStatus: e.target.value }))}>
                  <option value="online">🟢 Online — Available</option>
                  <option value="busy">🟡 Busy — Limited</option>
                  <option value="offline">⚫ Offline — Unavailable</option>
                </select>
              </div>
              <div className="flex flex-col gap-2.5 justify-center">
                {[['isVerified', '✓ Mark as Verified'], ['isStudent', '🎓 Student / Local Talent'], ['isFeatured', '⭐ Featured Provider']].map(([k, l]) => (
                  <label key={k} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="accent-saffron-500 w-4 h-4"
                      checked={form[k]} onChange={e => setForm(p => ({ ...p, [k]: e.target.checked }))} />
                    <span className="text-sm font-medium text-ink-700">{l}</span>
                  </label>
                ))}
              </div>
              <div className="sm:col-span-2 flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1 py-3">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 py-3 disabled:opacity-60">
                  {saving ? 'Saving...' : editing ? 'Update Provider' : 'Add Provider'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
