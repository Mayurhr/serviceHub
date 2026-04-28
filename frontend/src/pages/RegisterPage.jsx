import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ALLOWED_CITIES } from '../utils/api';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', city: 'Davanagere' });
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const submit = async e => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    const r = await register(form);
    if (r.success) { toast.success('Account created!'); navigate('/'); }
    else toast.error(r.message);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-saffron-50 via-white to-violet-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-saffron-gradient rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-4 text-2xl">⚡</div>
          <h1 className="text-3xl font-bold text-ink-900">Create Account</h1>
          <p className="text-ink-500 mt-2">Join ServeEase Pro in your city</p>
        </div>
        <div className="card-flat p-8">
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-ink-700 mb-2">Full Name *</label>
              <input type="text" className="input-field" placeholder="Your full name"
                value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink-700 mb-2">Email Address *</label>
              <input type="email" className="input-field" placeholder="you@example.com"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink-700 mb-2">Phone Number</label>
              <input type="tel" className="input-field" placeholder="10-digit mobile number"
                value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink-700 mb-2">Your City *</label>
              <select className="input-field" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} required>
                {ALLOWED_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <p className="text-xs text-ink-400 mt-1">Services are available in these cities only</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink-700 mb-2">Password *</label>
              <input type="password" className="input-field" placeholder="Minimum 6 characters"
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base mt-2 disabled:opacity-60">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
          <p className="text-center text-sm text-ink-600 mt-5">
            Already have an account? <Link to="/login" className="text-saffron-500 font-semibold hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
