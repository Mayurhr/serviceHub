import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingsAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function DashboardPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bookingsAPI.getMy()
      .then(r => setBookings(r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner fullPage text="Loading dashboard..." />;

  // Correct calculations: only count completed bookings for spent amount
  const completedBookings = bookings.filter(b => b.status === 'completed');
  const totalSpent = completedBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  // Count by status
  const counts = bookings.reduce((acc, b) => {
    acc[b.status] = (acc[b.status] || 0) + 1;
    return acc;
  }, {});

  // Category-wise spending — only from completed bookings
  const catSpend = {};
  completedBookings.forEach(b => {
    const catName = b.service?.category?.name || 'Other';
    catSpend[catName] = (catSpend[catName] || 0) + (b.totalAmount || 0);
  });

  // Recent 5 bookings
  const recent = bookings.slice(0, 5);

  const activeCount = (counts.accepted || 0) + (counts.traveling || 0) + (counts.started || 0) + (counts.in_progress || 0);

  return (
    <div className="page-container py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-ink-900">Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
        <p className="text-ink-500 mt-1">Your service booking summary · {user?.city}</p>
      </div>

      {/* Stats — no fake or incorrect values */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-saffron-500 to-saffron-600 text-white rounded-2xl p-5 shadow-lg">
          <div className="flex justify-between items-start mb-2"><span className="text-white/70 text-sm">Total Bookings</span><span className="text-2xl">📋</span></div>
          <div className="text-3xl font-extrabold">{bookings.length}</div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl p-5 shadow-lg">
          <div className="flex justify-between items-start mb-2"><span className="text-white/70 text-sm">Amount Spent</span><span className="text-2xl">💰</span></div>
          <div className="text-3xl font-extrabold">₹{totalSpent.toLocaleString()}</div>
          <div className="text-white/60 text-xs mt-1">On completed bookings</div>
        </div>
        <div className="bg-gradient-to-br from-violet-500 to-violet-600 text-white rounded-2xl p-5 shadow-lg">
          <div className="flex justify-between items-start mb-2"><span className="text-white/70 text-sm">Completed</span><span className="text-2xl">🎉</span></div>
          <div className="text-3xl font-extrabold">{counts.completed || 0}</div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl p-5 shadow-lg">
          <div className="flex justify-between items-start mb-2"><span className="text-white/70 text-sm">Active Now</span><span className="text-2xl">🔧</span></div>
          <div className="text-3xl font-extrabold">{activeCount}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent bookings — show status, no misleading money */}
        <div className="lg:col-span-2">
          <div className="card-flat p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-ink-900">Recent Bookings</h2>
              <Link to="/my-bookings" className="text-saffron-500 text-sm font-semibold hover:underline">View all →</Link>
            </div>
            {recent.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-ink-500 mb-3">No bookings yet</p>
                <Link to="/services" className="btn-primary text-sm py-2">Book a Service</Link>
              </div>
            ) : recent.map(b => (
              <div key={b._id} className="flex items-center gap-3 py-3 border-b border-ink-50 last:border-0">
                <img
                  src={b.service?.images?.[0] || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=100'}
                  className="w-12 h-12 rounded-xl object-cover shrink-0"
                  onError={e => { e.target.src = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=80'; }} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-ink-900 text-sm line-clamp-1">{b.service?.name}</p>
                  <p className="text-xs text-ink-500">
                    {new Date(b.bookingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} · {b.timeSlot}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full block mb-1 ${
                    b.status === 'completed' ? 'bg-green-100 text-green-700' :
                    b.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                    ['traveling','started','in_progress'].includes(b.status) ? 'bg-blue-100 text-blue-700' :
                    'bg-amber-100 text-amber-700'}`}>
                    {b.status.replace('_', ' ')}
                  </span>
                  {b.status === 'completed' && (
                    <p className="font-bold text-saffron-500 text-xs">₹{b.totalAmount?.toLocaleString()}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Spending by category — only from completed bookings */}
          <div className="card-flat p-5">
            <h2 className="font-bold text-ink-900 mb-4">Spending by Category</h2>
            <p className="text-xs text-ink-400 mb-3">Based on completed bookings only</p>
            {Object.keys(catSpend).length === 0 ? (
              <p className="text-ink-500 text-sm text-center py-4">Complete a booking to see spending</p>
            ) : Object.entries(catSpend).sort(([, a], [, b]) => b - a).map(([cat, amt]) => {
              const maxAmt = Math.max(...Object.values(catSpend));
              const pct = maxAmt > 0 ? Math.round((amt / maxAmt) * 100) : 0;
              return (
                <div key={cat} className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-ink-700">{cat}</span>
                    <span className="font-bold text-saffron-500">₹{amt.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-ink-100 rounded-full overflow-hidden">
                    <div className="h-full bg-saffron-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="card-flat p-5">
            <h2 className="font-bold text-ink-900 mb-4">Quick Actions</h2>
            <div className="space-y-2">
              {[
                ['🛠️ Book a Service', '/services', 'btn-primary'],
                ['👥 Find Providers', '/providers', 'btn-secondary'],
                ['📅 My Bookings', '/my-bookings', 'btn-secondary'],
                ['👤 Edit Profile', '/profile', 'btn-secondary'],
              ].map(([l, p, c]) => (
                <Link key={p} to={p} className={`${c} w-full py-2.5 text-sm`}>{l}</Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
