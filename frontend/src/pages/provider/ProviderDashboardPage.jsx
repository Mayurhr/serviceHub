import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { providersAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StarRating from '../../components/common/StarRating';
import TrustScore from '../../components/common/TrustScore';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  pending:     { label: 'Pending',     color: 'bg-amber-100 text-amber-700',   icon: '⏳' },
  accepted:    { label: 'Accepted',    color: 'bg-blue-100 text-blue-700',     icon: '✅' },
  started:     { label: 'Started',     color: 'bg-violet-100 text-violet-700', icon: '🔧' },
  in_progress: { label: 'In Progress', color: 'bg-orange-100 text-orange-700', icon: '⚙️' },
  completed:   { label: 'Completed',   color: 'bg-green-100 text-green-700',   icon: '🎉' },
  cancelled:   { label: 'Cancelled',   color: 'bg-red-100 text-red-700',       icon: '❌' },
};

export default function ProviderDashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    providersAPI.getDashboard()
      .then(r => setData(r.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner fullPage text="Loading your dashboard..." />;
  if (!data) return <div className="page-container py-8"><p className="text-ink-500">Could not load dashboard.</p></div>;

  const { bookings = [], provider, totalEarnings = 0, counts = {} } = data;
  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  return (
    <div className="page-container py-8 animate-fade-in">
      {/* Provider header */}
      <div className="card-flat p-6 mb-8 flex flex-col sm:flex-row items-center sm:items-start gap-5">
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-extrabold text-white shrink-0 shadow-lg"
          style={{ background: 'linear-gradient(135deg,#7c3aed,#6366f1)' }}>
          {provider?.name?.[0]?.toUpperCase()}
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h1 className="text-2xl font-extrabold text-ink-900">{provider?.name}</h1>
          <p className="text-ink-500 text-sm">{provider?.email} · 📍 {provider?.city}</p>
          <div className="flex items-center gap-3 mt-2 flex-wrap justify-center sm:justify-start">
            <StarRating rating={provider?.rating || 0} size="md" showCount count={provider?.numReviews} />
            <TrustScore score={provider?.trustScore || 0} />
            {provider?.isVerified && <span className="badge badge-verified">✓ Verified</span>}
          </div>
        </div>
        <div className="text-center">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold
            ${provider?.availabilityStatus === 'online' ? 'bg-green-100 text-green-700' :
              provider?.availabilityStatus === 'busy' ? 'bg-amber-100 text-amber-700' : 'bg-ink-100 text-ink-600'}`}>
            <span className={`w-2 h-2 rounded-full ${provider?.availabilityStatus === 'online' ? 'bg-green-500 animate-pulse' : provider?.availabilityStatus === 'busy' ? 'bg-amber-500' : 'bg-ink-400'}`} />
            {provider?.availabilityStatus === 'online' ? 'Online' : provider?.availabilityStatus === 'busy' ? 'Busy' : 'Offline'}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { l: 'Total Bookings', v: bookings.length, i: '📋', c: 'from-saffron-500 to-saffron-600' },
          { l: 'Completed Jobs', v: provider?.completedJobs || 0, i: '🎉', c: 'from-green-500 to-green-600' },
          { l: 'Total Earnings', v: `₹${totalEarnings.toLocaleString()}`, i: '💰', c: 'from-violet-500 to-violet-600' },
          { l: 'Pending', v: counts.pending || 0, i: '⏳', c: 'from-amber-500 to-amber-600' },
        ].map((s, i) => (
          <div key={i} className={`bg-gradient-to-br ${s.c} text-white rounded-2xl p-5 shadow-lg`}>
            <div className="flex justify-between items-start mb-2">
              <span className="text-white/70 text-sm">{s.l}</span>
              <span className="text-2xl">{s.i}</span>
            </div>
            <div className="text-2xl font-extrabold">{s.v}</div>
          </div>
        ))}
      </div>

      {/* Bookings list */}
      <div className="card-flat p-6">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <h2 className="font-bold text-ink-900 text-lg">My Bookings</h2>
          <div className="flex gap-2 flex-wrap">
            {['all','pending','accepted','in_progress','completed','cancelled'].map(v => (
              <button key={v} onClick={() => setFilter(v)}
                className={`text-xs font-bold px-3 py-1.5 rounded-full transition-all capitalize
                  ${filter === v ? 'bg-saffron-500 text-white' : 'bg-ink-100 text-ink-600 hover:bg-ink-200'}`}>
                {v.replace('_',' ')}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-3">📅</div>
            <p className="text-ink-500">No {filter === 'all' ? '' : filter} bookings yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(b => {
              const sc = STATUS_CONFIG[b.status] || STATUS_CONFIG.pending;
              return (
                <div key={b._id} className="border border-ink-100 rounded-2xl p-4 hover:border-saffron-200 transition-all">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <img src={b.service?.images?.[0] || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=150'}
                      className="w-full sm:w-20 h-16 sm:h-20 object-cover rounded-xl shrink-0"
                      onError={e => { e.target.src = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=100'; }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between flex-wrap gap-2 mb-2">
                        <div>
                          <h3 className="font-bold text-ink-900">{b.service?.name}</h3>
                          <p className="text-ink-400 text-xs font-mono">{b.bookingId}</p>
                        </div>
                        <span className={`badge ${sc.color} font-bold`}>{sc.icon} {sc.label}</span>
                      </div>
                      <div className="flex flex-wrap gap-3 text-sm text-ink-600 mb-1">
                        <span>📅 {new Date(b.bookingDate).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</span>
                        <span>🕐 {b.timeSlot}</span>
                        <span className="font-bold text-saffron-500">₹{b.totalAmount?.toLocaleString()}</span>
                      </div>
                      <p className="text-xs text-ink-500">👤 {b.user?.name} · 📞 {b.user?.phone}</p>
                      <p className="text-xs text-ink-500">📍 {b.address}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
