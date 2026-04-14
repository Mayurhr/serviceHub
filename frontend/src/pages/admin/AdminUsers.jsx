import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../utils/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const AdminNav = ({ active }) => (
  <div className="flex gap-2 flex-wrap mb-8">
    {[['📊 Dashboard','/admin'],['🛠️ Services','/admin/services'],['👥 Providers','/admin/providers'],['📅 Bookings','/admin/bookings'],['👤 Users','/admin/users']].map(([l,p]) => (
      <Link key={p} to={p} className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${active===p?'bg-saffron-500 text-white shadow-md':'bg-white border border-ink-200 text-ink-600 hover:border-saffron-300'}`}>{l}</Link>
    ))}
  </div>
);

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { adminAPI.getUsers().then(r => setUsers(r.data)).catch(() => {}).finally(() => setLoading(false)); }, []);

  const toggle = async id => {
    try {
      await adminAPI.toggleUser(id);
      setUsers(prev => prev.map(u => u._id === id ? { ...u, isActive: !u.isActive } : u));
      toast.success('User status updated');
    } catch { toast.error('Failed'); }
  };

  const filtered = users.filter(u =>
    !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-container py-8 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-ink-900">Manage Users</h1>
        <p className="text-ink-500 mt-1">{users.length} registered customers</p>
      </div>
      <AdminNav active="/admin/users" />

      <div className="mb-5">
        <input type="text" className="input-field max-w-sm" placeholder="🔍 Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? <LoadingSpinner fullPage /> : (
        <div className="card-flat overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-ink-50 border-b border-ink-100">
                <tr>{['User', 'Email', 'Phone', 'City', 'Bookings Spent', 'Joined', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-bold text-ink-500 uppercase tracking-wide">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-ink-50">
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-16 text-ink-400 font-medium">No users found</td></tr>
                ) : filtered.map(u => (
                  <tr key={u._id} className="hover:bg-ink-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-saffron-100 rounded-full flex items-center justify-center text-saffron-700 font-bold text-sm">{u.name?.[0]?.toUpperCase()}</div>
                        <span className="font-semibold text-ink-800">{u.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-ink-600 text-xs">{u.email}</td>
                    <td className="py-3 px-4 text-ink-600 text-xs">{u.phone || '—'}</td>
                    <td className="py-3 px-4 text-ink-600 text-xs">{u.city || '—'}</td>
                    <td className="py-3 px-4">
                      <p className="text-xs font-semibold text-ink-700">{u.totalBookings || 0} bookings</p>
                      <p className="text-xs text-saffron-500 font-bold">₹{(u.totalSpent || 0).toLocaleString()}</p>
                    </td>
                    <td className="py-3 px-4 text-ink-500 text-xs">{new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    <td className="py-3 px-4">
                      <span className={`badge text-[10px] ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{u.isActive ? '✓ Active' : '✗ Inactive'}</span>
                    </td>
                    <td className="py-3 px-4">
                      <button onClick={() => toggle(u._id)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${u.isActive ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
