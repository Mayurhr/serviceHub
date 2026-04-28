import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { providersAPI, adminAPI, ALLOWED_CITIES } from '../../utils/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import TrustScore from '../../components/common/TrustScore';
import toast from 'react-hot-toast';
import ProviderAvatar from '../../components/common/ProviderAvatar';

const AdminNav = ({ active }) => (
  <div className="flex gap-2 flex-wrap mb-8">
    {[['Dashboard','/admin'],['Services','/admin/services'],['Providers','/admin/providers'],['Users','/admin/users']].map(([l,p]) => (
      <Link key={p} to={p} className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${active===p?'bg-saffron-500 text-white shadow-md':'bg-white border border-ink-200 text-ink-600 hover:border-saffron-300'}`}>{l}</Link>
    ))}
  </div>
);

const emptyForm = { name: '', email: '', phone: '', password: 'provider123', bio: '', experience: 1, city: 'Davanagere', skills: '', availabilityStatus: 'online', isVerified: false, isStudent: false, isFeatured: false };

export default function AdminProviders() {
  const location = useLocation();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [pwModal, setPwModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('');

  useEffect(() => {
    providersAPI.getAll({ limit: 100 })
      .then(r => setProviders(r.data || []))
      .catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (location.state?.openAdd) { openAdd(); window.history.replaceState({}, ''); }
  }, [location.state]);

  const openAdd = () => { setEditing(null); setForm(emptyForm); setModal(true); };

  const openEdit = p => {
    setEditing(p);
    setForm({ name: p.name, email: p.email, phone: p.phone, password: '', bio: p.bio || '', experience: p.experience, city: p.city || 'Davanagere', skills: (p.skills || []).join(', '), availabilityStatus: p.availabilityStatus, isVerified: p.isVerified, isStudent: p.isStudent, isFeatured: p.isFeatured });
    setModal(true);
  };

  const openPasswordChange = p => { setEditing(p); setNewPassword(''); setPwModal(true); };

  const save = async e => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone) return toast.error('Name, email and phone are required');
    if (!editing && !form.password) return toast.error('Password required for new providers');
    setSaving(true);
    try {
      const payload = { ...form, skills: form.skills.split(',').map(s => s.trim()).filter(Boolean) };
      if (!payload.password) delete payload.password;
      if (editing) {
        // Use admin endpoint to edit provider details
        await adminAPI.updateProvider(editing._id, payload);
        setProviders(prev => prev.map(p => p._id === editing._id ? { ...p, ...payload } : p));
        toast.success('Provider updated!');
      } else {
        const r = await providersAPI.create(payload);
        setProviders(prev => [r.data, ...prev]);
        toast.success('Provider added!');
      }
      setModal(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save provider'); }
    finally { setSaving(false); }
  };

  const changePassword = async e => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    setSaving(true);
    try {
      await adminAPI.changeProviderPassword(editing._id, { newPassword });
      toast.success('Password updated securely!');
      setPwModal(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to update password'); }
    finally { setSaving(false); }
  };

  const deactivate = async id => {
    if (!confirm('Deactivate this provider?')) return;
    try {
      await providersAPI.delete(id);
      setProviders(prev => prev.map(p => p._id === id ? { ...p, isActive: false } : p));
      toast.success('Provider deactivated');
    } catch { toast.error('Failed'); }
  };

  const filtered = providers.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.email.toLowerCase().includes(search.toLowerCase());
    const matchCity = !cityFilter || p.city === cityFilter;
    return matchSearch && matchCity;
  });

  if (loading) return <LoadingSpinner fullPage text="Loading providers..." />;

  return (
    <div className="page-container py-8 animate-fade-in">
      <AdminNav active="/admin/providers" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-ink-900">Manage Providers</h1>
          <p className="text-ink-500">{providers.length} providers across Karnataka</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2 whitespace-nowrap">
          + Add Provider
        </button>
      </div>

      <div className="flex gap-3 mb-6 flex-wrap">
        <input type="text" placeholder="Search providers..." className="input-field flex-1 min-w-[200px]"
          value={search} onChange={e => setSearch(e.target.value)} />
        <select className="input-field w-auto" value={cityFilter} onChange={e => setCityFilter(e.target.value)}>
          <option value="">All Cities</option>
          {ALLOWED_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(p => (
          <div key={p._id} className={`card-flat p-5 transition-all hover:shadow-md border ${p.isActive ? 'border-ink-100' : 'border-red-100 bg-red-50/30 opacity-60'}`}>
            <div className="flex items-start gap-3 mb-3">
              <ProviderAvatar provider={p} size="md" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 flex-wrap">
                  <h3 className="font-bold text-ink-900 truncate">{p.name}</h3>
                  {p.isVerified && <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-semibold">✓</span>}
                  {p.isFeatured && <span className="text-xs bg-saffron-100 text-saffron-700 px-1.5 py-0.5 rounded-full font-semibold">★</span>}
                  {!p.isActive && <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full font-semibold">Inactive</span>}
                </div>
                <p className="text-ink-500 text-xs">{p.email}</p>
                <p className="text-ink-500 text-xs">{p.phone} · {p.city}</p>
              </div>
            </div>
            <div className="flex items-center justify-between mb-3">
              <TrustScore score={p.trustScore} />
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${p.availabilityStatus === 'online' ? 'bg-green-100 text-green-700' : p.availabilityStatus === 'busy' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                {p.availabilityStatus}
              </span>
            </div>
            <div className="grid grid-cols-3 text-center mb-3 bg-ink-50 rounded-xl p-2">
              <div><p className="text-xs text-ink-500">Rating</p><p className="font-bold text-sm text-amber-500">★ {p.rating?.toFixed(1)}</p></div>
              <div><p className="text-xs text-ink-500">Jobs</p><p className="font-bold text-sm">{p.totalJobs}</p></div>
              <div><p className="text-xs text-ink-500">Done</p><p className="font-bold text-sm text-green-600">{p.completedJobs}</p></div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => openEdit(p)} className="btn-secondary flex-1 text-xs py-2">Edit Details</button>
              <button onClick={() => openPasswordChange(p)} className="flex-1 text-xs py-2 rounded-xl border-2 border-violet-200 text-violet-700 hover:bg-violet-50 font-semibold transition-all">Change Pwd</button>
              {p.isActive && <button onClick={() => deactivate(p._id)} className="text-xs py-2 px-3 rounded-xl border-2 border-red-200 text-red-600 hover:bg-red-50 font-semibold transition-all">Disable</button>}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-16">
            <p className="text-ink-400 text-lg">No providers found</p>
          </div>
        )}
      </div>

      {/* Edit/Add Provider Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-extrabold text-ink-900">{editing ? 'Edit Provider' : 'Add New Provider'}</h2>
              <button onClick={() => setModal(false)} className="text-ink-400 hover:text-ink-700 text-2xl font-bold leading-none">&times;</button>
            </div>
            <form onSubmit={save} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-ink-700 mb-1">Name *</label>
                  <input type="text" className="input-field" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
                </div>
                <div>
                  <label className="block text-sm font-bold text-ink-700 mb-1">Phone *</label>
                  <input type="tel" className="input-field" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-ink-700 mb-1">Email *</label>
                <input type="email" className="input-field" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
              </div>
              {!editing && (
                <div>
                  <label className="block text-sm font-bold text-ink-700 mb-1">Password *</label>
                  <input type="text" className="input-field" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="Min 6 characters" required />
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-ink-700 mb-1">City *</label>
                  <select className="input-field" value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))}>
                    {ALLOWED_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-ink-700 mb-1">Experience (yrs)</label>
                  <input type="number" min={0} className="input-field" value={form.experience} onChange={e => setForm(p => ({ ...p, experience: +e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-ink-700 mb-1">Bio</label>
                <textarea rows={2} className="input-field resize-none" value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-bold text-ink-700 mb-1">Skills (comma-separated)</label>
                <input type="text" className="input-field" value={form.skills} onChange={e => setForm(p => ({ ...p, skills: e.target.value }))} placeholder="Plumbing, Welding, AC Repair" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-ink-700">
                  <input type="checkbox" className="accent-green-500" checked={form.isVerified} onChange={e => setForm(p => ({ ...p, isVerified: e.target.checked }))} />
                  Verified
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-ink-700">
                  <input type="checkbox" className="accent-saffron-500" checked={form.isFeatured} onChange={e => setForm(p => ({ ...p, isFeatured: e.target.checked }))} />
                  Featured
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-ink-700">
                  <input type="checkbox" className="accent-blue-500" checked={form.isStudent} onChange={e => setForm(p => ({ ...p, isStudent: e.target.checked }))} />
                  Student
                </label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1 py-3">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 py-3 disabled:opacity-60">
                  {saving ? 'Saving...' : editing ? 'Update Provider' : 'Add Provider'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {pwModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={e => e.target === e.currentTarget && setPwModal(false)}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-extrabold text-ink-900">Change Password</h2>
              <button onClick={() => setPwModal(false)} className="text-ink-400 hover:text-ink-700 text-2xl font-bold leading-none">&times;</button>
            </div>
            <p className="text-sm text-ink-500 mb-4">Updating password for <strong>{editing?.name}</strong>. Password is stored securely (bcrypt hashed).</p>
            <form onSubmit={changePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-ink-700 mb-1">New Password *</label>
                <input type="text" className="input-field" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Minimum 6 characters" required minLength={6} />
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
                Password will be hashed before storing. Provider can use this to log in.
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setPwModal(false)} className="btn-secondary flex-1 py-3">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 py-3 disabled:opacity-60">
                  {saving ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
