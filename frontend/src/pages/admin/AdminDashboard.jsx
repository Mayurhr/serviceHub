import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../utils/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const STATUS_COLOR = {
  pending: 'status-pending', accepted: 'status-accepted', traveling: 'status-traveling',
  completed: 'status-completed', cancelled: 'status-cancelled', in_progress: 'status-in_progress', started: 'status-started',
};

const AdminNav = ({ active }) => (
  <div className="flex gap-2 flex-wrap mb-8">
    {[
      ['📊 Dashboard', '/admin'],
      ['🛠️ Services', '/admin/services'],
      ['👥 Providers', '/admin/providers'],
      ['📅 Bookings', '/admin/bookings'],
      ['👤 Users', '/admin/users'],
    ].map(([l, p]) => (
      <Link key={p} to={p}
        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all
          ${active === p ? 'bg-saffron-500 text-white shadow-md' : 'bg-white border border-ink-200 text-ink-600 hover:border-saffron-300'}`}>
        {l}
      </Link>
    ))}
  </div>
);

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getStats()
      .then(r => setStats(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner fullPage text="Loading dashboard..." />;
  if (!stats) return (
    <div className="page-container py-8">
      <p className="text-ink-500">Failed to load stats. Make sure you are logged in as admin.</p>
    </div>
  );

  return (
    <div className="page-container py-8 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-ink-900">Admin Dashboard</h1>
        <p className="text-ink-500 mt-1">Manage your platform</p>
      </div>

      <AdminNav active="/admin" />

      {/* Quick Actions — prominent add buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Link to="/admin/services" state={{ openAdd: true }}
          className="flex items-center gap-3 bg-saffron-500 hover:bg-saffron-600 text-white rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl">🛠️</div>
          <div>
            <p className="font-extrabold text-base">Add Service</p>
            <p className="text-saffron-100 text-xs">Create a new service</p>
          </div>
        </Link>

        <Link to="/admin/providers" state={{ openAdd: true }}
          className="flex items-center gap-3 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl">👥</div>
          <div>
            <p className="font-extrabold text-base">Add Provider</p>
            <p className="text-violet-100 text-xs">Register a new provider</p>
          </div>
        </Link>

        <Link to="/admin/bookings"
          className="flex items-center gap-3 bg-green-600 hover:bg-green-700 text-white rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl">📅</div>
          <div>
            <p className="font-extrabold text-base">View Bookings</p>
            <p className="text-green-100 text-xs">Manage all bookings</p>
          </div>
        </Link>

        <Link to="/admin/users"
          className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl">👤</div>
          <div>
            <p className="font-extrabold text-base">Manage Users</p>
            <p className="text-blue-100 text-xs">View & control users</p>
          </div>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {[
          { l: 'Registered Users', v: stats.users, i: '👥', c: 'from-blue-500 to-blue-600', link: '/admin/users' },
          { l: 'Active Providers', v: stats.providers, i: '⭐', c: 'from-violet-500 to-violet-600', link: '/admin/providers' },
          { l: 'Active Services', v: stats.services, i: '🛠️', c: 'from-saffron-500 to-saffron-600', link: '/admin/services' },
          { l: 'Total Bookings', v: stats.bookings, i: '📅', c: 'from-green-500 to-green-600', link: '/admin/bookings' },
          { l: 'Revenue (Completed)', v: `₹${(stats.revenue || 0).toLocaleString()}`, i: '💰', c: 'from-emerald-500 to-emerald-600', link: '/admin/bookings' },
        ].map((c, i) => (
          <Link to={c.link} key={i}
            className={`bg-gradient-to-br ${c.c} rounded-2xl p-5 text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-1`}>
            <div className="flex justify-between items-start mb-3">
              <span className="text-white/70 text-xs font-medium leading-tight">{c.l}</span>
              <span className="text-2xl">{c.i}</span>
            </div>
            <div className="text-2xl font-extrabold">{c.v}</div>
          </Link>
        ))}
      </div>

      {/* Booking status breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="card-flat p-6">
          <h3 className="font-bold text-ink-900 mb-5">Bookings by Status</h3>
          {!stats.bookingsByStatus?.length ? (
            <p className="text-ink-400 text-sm text-center py-4">No booking data yet</p>
          ) : stats.bookingsByStatus.map(b => {
            const pct = stats.bookings > 0 ? Math.round((b.count / stats.bookings) * 100) : 0;
            return (
              <div key={b._id} className="mb-3">
                <div className="flex justify-between text-sm mb-1.5">
                  <span className={`badge ${STATUS_COLOR[b._id] || 'status-pending'} capitalize`}>
                    {b._id?.replace('_', ' ')}
                  </span>
                  <span className="font-bold text-ink-700">{b.count} <span className="text-ink-400 font-normal">({pct}%)</span></span>
                </div>
                <div className="h-2 bg-ink-100 rounded-full overflow-hidden">
                  <div className="h-full bg-saffron-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>

        <div className="card-flat p-6">
          <h3 className="font-bold text-ink-900 mb-1">Revenue by Status</h3>
          <p className="text-ink-400 text-xs mb-4">Only completed bookings count as actual revenue</p>
          {!stats.bookingsByStatus?.length ? (
            <p className="text-ink-400 text-sm text-center py-4">No data yet</p>
          ) : stats.bookingsByStatus.map(b => (
            <div key={b._id} className="flex items-center justify-between py-2.5 border-b border-ink-50 last:border-0">
              <div className="flex items-center gap-2">
                <span className={`badge ${STATUS_COLOR[b._id] || 'status-pending'} capitalize text-[10px]`}>
                  {b._id?.replace('_', ' ')}
                </span>
                {b._id === 'completed' && <span className="text-[10px] text-green-600 font-bold">← counted</span>}
              </div>
              <span className={`font-bold text-sm ${b._id === 'completed' ? 'text-saffron-500' : 'text-ink-400'}`}>
                ₹{(b.revenue || 0).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent bookings */}
      <div className="card-flat p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-ink-900">Recent Bookings</h3>
          <Link to="/admin/bookings" className="text-saffron-500 text-sm font-semibold hover:underline">View all →</Link>
        </div>
        {!stats.recentBookings?.length ? (
          <div className="text-center py-10">
            <p className="text-ink-400 mb-3">No bookings yet.</p>
            <p className="text-ink-500 text-sm">Services and providers must be added first.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-100">
                  {['Booking ID', 'Customer', 'Service', 'Amount', 'Status', 'Date'].map(h => (
                    <th key={h} className="text-left py-3 pr-4 text-xs font-bold text-ink-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-50">
                {stats.recentBookings.map(b => (
                  <tr key={b._id} className="hover:bg-ink-50 transition-colors">
                    <td className="py-3 pr-4 font-mono text-xs text-ink-500">{b.bookingId?.slice(0, 14)}</td>
                    <td className="py-3 pr-4 font-semibold text-ink-800">{b.user?.name}</td>
                    <td className="py-3 pr-4 text-ink-600 max-w-[120px] truncate">{b.service?.name}</td>
                    <td className="py-3 pr-4 font-bold text-saffron-500">₹{b.totalAmount?.toLocaleString()}</td>
                    <td className="py-3 pr-4">
                      <span className={`badge ${STATUS_COLOR[b.status] || 'status-pending'} text-[10px]`}>
                        {b.status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 text-ink-500 text-xs">
                      {new Date(b.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
