import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingsAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
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

// User can only mark completed (when in_progress) and cancel (when pending only)
const getUserActions = (booking) => {
  const actions = [];
  if (booking.status === 'in_progress') actions.push({ label: 'Mark Completed', next: 'completed', style: 'bg-green-600 text-white hover:bg-green-700' });
  if (booking.status === 'pending') actions.push({ label: 'Cancel Booking', next: 'cancel', style: 'bg-red-50 text-red-600 border-2 border-red-200 hover:bg-red-100' });
  return actions;
};

export default function MyBookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    bookingsAPI.getMy()
      .then(r => setBookings(r.data || []))
      .catch(() => toast.error('Failed to load bookings'))
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id, next) => {
    if (next === 'cancel') {
      if (!confirm('Cancel this booking? You can only cancel before the provider accepts.')) return;
      setUpdating(id);
      try {
        await bookingsAPI.cancel(id, { reason: 'Cancelled by user' });
        setBookings(prev => prev.map(b => b._id === id ? { ...b, status: 'cancelled' } : b));
        toast.success('Booking cancelled');
      } catch (e) { toast.error(e.response?.data?.message || 'Cannot cancel at this stage'); }
      finally { setUpdating(null); }
      return;
    }
    setUpdating(id);
    try {
      await bookingsAPI.track(id, { status: next, note: 'Marked by user' });
      setBookings(prev => prev.map(b => b._id === id ? { ...b, status: next } : b));
      toast.success('Status updated!');
    } catch (e) { toast.error(e.response?.data?.message || 'Update failed'); }
    finally { setUpdating(null); }
  };

  const filtered = filter === 'all' ? bookings : filter === 'active'
    ? bookings.filter(b => ['accepted','traveling','started','in_progress'].includes(b.status))
    : bookings.filter(b => b.status === filter);
  const counts = bookings.reduce((a, b) => { a[b.status] = (a[b.status] || 0) + 1; return a; }, {});
  const activeCount = (counts.accepted || 0) + (counts.traveling || 0) + (counts.started || 0) + (counts.in_progress || 0);

  if (loading) return <LoadingSpinner fullPage text="Loading bookings..." />;

  return (
    <div className="page-container py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-ink-900">My Bookings</h1>
        <p className="text-ink-500 mt-1">{bookings.length} total bookings</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          ['all', 'All', bookings.length, '📋'],
          ['pending', 'Pending', counts.pending || 0, '⏳'],
          ['active', 'Active', activeCount, '🔧'],
          ['completed', 'Completed', counts.completed || 0, '🎉'],
        ].map(([val, label, count, icon]) => (
          <button key={val} onClick={() => setFilter(val)}
            className={`p-4 rounded-2xl border-2 text-center transition-all ${filter === val ? 'bg-saffron-500 border-saffron-500 text-white' : 'bg-white border-ink-100 text-ink-700 hover:border-saffron-200'}`}
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
          <p className="text-ink-500 mb-5">{filter === 'all' ? "You haven't made any bookings yet." : `No ${filter} bookings.`}</p>
          <Link to="/services" className="btn-primary">Browse Services</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(b => {
            const sc = STATUS_CONFIG[b.status] || STATUS_CONFIG.pending;
            const actions = getUserActions(b);
            return (
              <div key={b._id} className="card-flat p-5 hover:shadow-md transition-all border border-ink-100">
                <div className="flex flex-col sm:flex-row gap-4">
                  <img src={b.service?.images?.[0] || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=200'}
                    alt={b.service?.name} className="w-full sm:w-24 h-20 sm:h-24 object-cover rounded-xl shrink-0"
                    onError={e => { e.target.src = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=150'; }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2 flex-wrap">
                      <div>
                        <h3 className="font-bold text-ink-900 text-lg">{b.service?.name}</h3>
                        <p className="text-ink-500 text-sm">{b.bookingId}</p>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold shrink-0 ${sc.color}`}>
                        {sc.icon} {sc.label}
                      </span>
                    </div>

                    {/* Status progress bar */}
                    <div className="flex items-center gap-1 mb-3 overflow-x-auto pb-1">
                      {['pending','accepted','traveling','started','in_progress','completed'].map((s, i) => {
                        const statusIdx = ['pending','accepted','traveling','started','in_progress','completed'].indexOf(b.status);
                        const isCancelled = b.status === 'cancelled';
                        return (
                          <div key={s} className="flex items-center shrink-0">
                            <div className={`w-2 h-2 rounded-full ${isCancelled ? 'bg-red-300' : i <= statusIdx ? 'bg-green-500' : 'bg-ink-200'}`} />
                            {i < 5 && <div className={`w-4 h-0.5 ${isCancelled ? 'bg-red-200' : i < statusIdx ? 'bg-green-400' : 'bg-ink-200'}`} />}
                          </div>
                        );
                      })}
                      <span className="text-xs text-ink-400 ml-1 shrink-0">{sc.label}</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-ink-500 mb-3">
                      <span>📅 {b.bookingDate ? new Date(b.bookingDate).toLocaleDateString('en-IN') : '—'}</span>
                      <span>🕐 {b.timeSlot || '—'}</span>
                      <span>💳 {b.paymentMethod?.toUpperCase()}</span>
                      {b.provider && <span>👤 {b.provider.name}</span>}
                      <span className="font-bold text-ink-900">₹{b.totalAmount?.toLocaleString()}</span>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      <Link to={`/booking/${b._id}`} className="btn-secondary text-xs py-1.5 px-3">View Details</Link>
                      {b.status === 'completed' && !b.isReviewed && (
                        <Link to={`/booking/${b._id}`} className="text-xs py-1.5 px-3 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 font-semibold transition-all">
                          Leave Review
                        </Link>
                      )}
                      {b.invoiceGenerated && (
                        <Link to={`/invoice/${b._id}`} className="text-xs py-1.5 px-3 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 font-semibold transition-all">
                          Invoice
                        </Link>
                      )}
                      {actions.map(action => (
                        <button key={action.next} onClick={() => updateStatus(b._id, action.next)} disabled={updating === b._id}
                          className={`text-xs py-1.5 px-3 rounded-xl font-semibold transition-all disabled:opacity-50 ${action.style}`}>
                          {updating === b._id ? '...' : action.label}
                        </button>
                      ))}
                    </div>

                    {/* Role permission hint */}
                    {['accepted','traveling','started'].includes(b.status) && (
                      <p className="text-xs text-ink-400 mt-2">
                        {b.status === 'accepted' ? '🚗 Waiting for provider to start traveling' :
                         b.status === 'traveling' ? '🔧 Waiting for admin to start the job' :
                         '⚙️ Waiting for provider to begin work'}
                      </p>
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
