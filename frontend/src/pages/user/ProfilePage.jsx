import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authAPI, ALLOWED_CITIES } from '../../utils/api';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();

  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || 'Davanagere',
    password: '',
    confirm: '',
  });

  const [tab, setTab] = useState('profile');
  const [saving, setSaving] = useState(false);

  const save = async e => {
    e.preventDefault();

    // 🚫 Block provider from saving
    if (user?.role === 'provider') {
      return toast.error('Providers cannot edit profile');
    }

    if (tab === 'security') {
      if (!form.password) return toast.error('Enter a new password');
      if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
      if (form.password !== form.confirm) return toast.error('Passwords do not match');
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name,
        phone: form.phone,
        address: form.address,
        city: form.city
      };

      if (tab === 'security' && form.password) payload.password = form.password;

      const r = await authAPI.updateProfile(payload);
      updateUser(r.data);

      toast.success('Profile updated successfully!');
      setForm(p => ({ ...p, password: '', confirm: '' }));
    } catch (e) {
      toast.error(e.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in">
      <h1 className="text-3xl font-extrabold text-ink-900 mb-2">My Profile</h1>
      <p className="text-ink-500 mb-8">Manage your account information</p>

      {/* Profile Card */}
      <div className="card-flat mb-6 overflow-visible">
        <div className="bg-gradient-to-r from-saffron-500 to-saffron-600 h-20 rounded-t-2xl relative">
          <div className="absolute -bottom-10 left-6">
            <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center text-3xl font-extrabold text-saffron-500 border-4 border-white shadow-lg">
              {user?.name?.[0]?.toUpperCase()}
            </div>
          </div>
        </div>

        <div className="pt-14 pb-5 px-6">
          <h2 className="font-extrabold text-xl text-ink-900">{user?.name}</h2>
          <p className="text-ink-500 text-sm">{user?.email}</p>

          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className={`badge text-xs ${
              user?.role === 'admin'
                ? 'bg-violet-100 text-violet-700'
                : 'bg-saffron-100 text-saffron-700'
            }`}>
              {user?.role === 'admin'
                ? '👑 Admin'
                : user?.role === 'provider'
                ? '👨‍🔧 Provider'
                : '👤 Customer'}
            </span>

            <span className="badge bg-green-100 text-green-700 text-xs">
              📍 {user?.city || 'Davanagere'}
            </span>
          </div>
        </div>
      </div>

      {/* Provider Notice */}
      {user?.role === 'provider' && (
        <p className="text-xs text-gray-400 mb-3">
          Profile is managed by admin. Editing is disabled.
        </p>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-ink-100 p-1 rounded-2xl">
        {[
          ['profile', '👤 Edit Profile'],
          ...(user?.role !== 'provider' ? [['security', '🔒 Change Password']] : [])
        ].map(([v, l]) => (
          <button
            key={v}
            onClick={() => setTab(v)}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all ${
              tab === v
                ? 'bg-white text-saffron-500 shadow-sm'
                : 'text-ink-600 hover:text-ink-900'
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      <div className="card-flat p-6">
        <form onSubmit={save} className="space-y-4">

          {tab === 'profile' ? (
            <>
              <input
                type="text"
                className="input-field"
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                disabled={user?.role === 'provider'}
                required
              />

              <input
                type="email"
                className="input-field bg-ink-50 cursor-not-allowed"
                value={user?.email}
                disabled
              />

              <input
                type="tel"
                className="input-field"
                value={form.phone}
                onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                disabled={user?.role === 'provider'}
              />

              <select
                className="input-field"
                value={form.city}
                onChange={e => setForm(p => ({ ...p, city: e.target.value }))}
                disabled={user?.role === 'provider'}
              >
                {ALLOWED_CITIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <textarea
                rows={2}
                className="input-field resize-none"
                value={form.address}
                onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
                disabled={user?.role === 'provider'}
              />
            </>
          ) : (
            <>
              <input
                type="password"
                className="input-field"
                placeholder="New Password"
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              />

              <input
                type="password"
                className="input-field"
                placeholder="Confirm Password"
                value={form.confirm}
                onChange={e => setForm(p => ({ ...p, confirm: e.target.value }))}
              />
            </>
          )}

          <button
            type="submit"
            disabled={saving || user?.role === 'provider'}
            className="btn-primary w-full py-3 disabled:opacity-60"
          >
            {user?.role === 'provider'
              ? 'View Only (Provider)'
              : saving
              ? 'Saving...'
              : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}