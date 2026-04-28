import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const submit = async e => {
    e.preventDefault();
    const r = await login(form);
    if (r.success) { toast.success('Welcome back!'); navigate('/'); }
    else toast.error(r.message);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-saffron-50 via-white to-violet-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-saffron-gradient rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-4 text-2xl">⚡</div>
          <h1 className="text-3xl font-bold text-ink-900">Welcome back</h1>
          <p className="text-ink-500 mt-2">Sign in to your ServeEase account</p>
        </div>
        <div className="card-flat p-8">
          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-ink-700 mb-2">Email Address</label>
              <input type="email" className="input-field" placeholder="you@example.com"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink-700 mb-2">Password</label>
              <input type="password" className="input-field" placeholder="••••••••"
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base disabled:opacity-60">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <p className="text-center text-sm text-ink-600 mt-5">
            Don't have an account? <Link to="/register" className="text-saffron-500 font-semibold hover:underline">Register free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
