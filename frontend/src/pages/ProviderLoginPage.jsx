import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function ProviderLoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const { providerLogin, loading } = useAuth();
  const navigate = useNavigate();

  const submit = async e => {
    e.preventDefault();
    const r = await providerLogin(form);
    if (r.success) { toast.success('Welcome, Provider!'); navigate('/provider/dashboard'); }
    else toast.error(r.message);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-saffron-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-violet-600 to-violet-700 rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-4 text-2xl">👨‍🔧</div>
          <h1 className="text-3xl font-bold text-ink-900">Provider Login</h1>
          <p className="text-ink-500 mt-2">Sign in to your provider account</p>
        </div>
        <div className="card-flat p-8">
          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-ink-700 mb-2">Email Address</label>
              <input type="email" className="input-field" placeholder="you@provider.com"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink-700 mb-2">Password</label>
              <input type="password" className="input-field" placeholder="••••••••"
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 text-base font-bold text-white bg-violet-600 hover:bg-violet-700 rounded-xl transition-all disabled:opacity-60 active:scale-95">
              {loading ? 'Signing in...' : 'Sign In as Provider'}
            </button>
          </form>
          <div className="mt-5 pt-4 border-t border-ink-100 text-center space-y-2">
            <p className="text-sm text-ink-500">Are you a customer?</p>
            <Link to="/login" className="text-saffron-500 font-semibold hover:underline text-sm">Customer Login →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
