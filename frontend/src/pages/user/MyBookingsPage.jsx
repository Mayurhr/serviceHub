import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingsAPI } from '../../utils/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  pending:     { label: 'Pending',     color: 'bg-amber-100 text-amber-700',   icon: '⏳' },
  accepted:    { label: 'Accepted',    color: 'bg-blue-100 text-blue-700',     icon: '✅' },
  traveling:   { label: 'On the Way',  color: 'bg-cyan-100 text-cyan-700',     icon: '🚗' },
  started:     { label: 'Started',     color: 'bg-violet-100 text-violet-700', icon: '🔧' },
  in_progress: { label: 'In Progress', color: 'bg-orange-100 text-orange-700', icon: '⚙️' },
  completed:   { label: 'Completed',   color: 'bg-green-100 text-green-700',   icon: '🎉' },
  cancelled:   { label: 'Cancelled',   color: 'bg-red-100 text-red-700',       icon: '❌' },
};

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [cancelling, setCancelling] = useState(null);

  useEffect(() => {
    bookingsAPI.getMy()
      .then(r => setBookings(r.data || []))
      .catch(() => toast.error('Failed to load bookings'))
      .finally(() => setLoading(false));
  }, []);

  const cancel = async id => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    setCancelling(id);
    try {
      await bookingsAPI.cancel(id, { reason: 'Cancelled by user' });
      setBookings(prev => prev.map(b => b._id === id ? { ...b, status: 'cancelled' } : b));
      toast.success('Booking cancelled');
    } catch { toast.error('Failed to cancel booking'); }
    finally { setCancelling(null); }
  };

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);
  const counts = bookings.reduce((a, b) => { a[b.status] = (a[b.status] || 0) + 1; return a; }, {});
  const activeCount = (counts.accepted || 0) + (counts.traveling || 0) + (counts.started || 0) + (counts.in_progress || 0);

  if (loading) return <LoadingSpinner fullPage text="Loading bookings..." />;

  return (
    <div className="page-container py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-ink-900">My Bookings</h1>
        <p className="text-ink-500 mt-1">{bookings.length} total bookings</p>
      </div>

      {/* Status filter tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          ['all', 'All', bookings.length, '📋'],
          ['pending', 'Pending', counts.pending || 0, '⏳'],
          ['active', 'Active', activeCount, '🔧'],
          ['completed', 'Completed', counts.completed || 0, '🎉'],
        ].map(([val, label, count, icon]) => (
          <button key={val}
            onClick={() => setFilter(val === 'active' ? 'accepted' : val)}
            className={`p-4 rounded-2xl border-2 text-center transition-all
              ${filter === val || (val === 'active' && ['accepted','traveling','started','in_progress'].includes(filter))
                ? 'bg-saffron-500 border-saffron-500 text-white'
                : 'bg-white border-ink-100 text-ink-700 hover:border-saffron-200'}`}
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <div className="text-2xl mb-1">{icon}</div>
            <div className="text-xl font-extrabold">{count}</div>
            <div className="text-xs opacity-80">{label}</div>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 card-flat">
          <div className="text-6xl mb-4">📅</div>
          <h3 className="text-xl font-bold text-ink-900 mb-2">No bookings found</h3>
          <p className="text-ink-500 mb-5">
            {filter === 'all' ? "You haven't made any bookings yet." : `No ${filter} bookings.`}
          </p>
          <Link to="/services" className="btn-primary">Browse Services</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(b => {
            const sc = STATUS_CONFIG[b.status] || STATUS_CONFIG.pending;
            return (
              <div key={b._id} className="card-flat p-5 hover:border-saffron-200 transition-all border border-ink-100">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Service image */}
                  <img
                    src={b.service?.images?.[0] || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=200'}
                    alt={b.service?.name}
                    className="w-full sm:w-24 h-20 sm:h-24 object-cover rounded-xl shrink-0"
                    onError={e => { e.target.src = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=150'; }}
                  />

                  {/* Booking info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap mb-2">
                      <div>
                        <h3 className="font-bold text-ink-900">{b.service?.name}</h3>
                        <p className="text-ink-400 text-xs font-mono">{b.bookingId}</p>
                        {b.isBundleBooking && (
                          <span className="badge bg-violet-100 text-violet-700 text-[10px] mt-1">📦 Bundle Booking</span>
                        )}
                      </div>
                      <span className={`badge ${sc.color} font-bold`}>
                        {sc.icon} {sc.label}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-3 text-sm text-ink-600 mb-2">
                      <span>📅 {new Date(b.bookingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      <span>🕐 {b.timeSlot}</span>
                      <span className="font-bold text-saffron-500">₹{b.totalAmount?.toLocaleString()}</span>
                      {b.discountAmount > 0 && (
                        <span className="text-green-600 font-semibold text-xs">saved ₹{b.discountAmount}</span>
                      )}
                    </div>

                    <p className="text-xs text-ink-500 mb-1">📍 {b.address}</p>
                    {b.provider && (
                      <p className="text-xs text-ink-500">
                        👨‍🔧 {b.provider.name} · 📞 {b.provider.phone}
                      </p>
                    )}
                  </div>

                  {/* Actions — NO tracking button */}
                  <div className="flex sm:flex-col gap-2 justify-end items-end shrink-0">
                    {b.status === 'completed' && (
                      <Link to={`/invoice/${b._id}`} className="btn-secondary py-1.5 px-3 text-xs">
                        🧾 Invoice
                      </Link>
                    )}
                    {['pending', 'accepted'].includes(b.status) && (
                      <button
                        onClick={() => cancel(b._id)}
                        disabled={cancelling === b._id}
                        className="text-xs text-red-600 border border-red-200 hover:bg-red-50 px-3 py-1.5 rounded-xl transition-colors disabled:opacity-60">
                        {cancelling === b._id ? '...' : 'Cancel'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
