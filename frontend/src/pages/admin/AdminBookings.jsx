import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingsAPI } from '../../utils/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const AdminNav = ({ active }) => (
  <div className="flex gap-2 flex-wrap mb-8">
    {[['Dashboard','/admin'],['Services','/admin/services'],['Providers','/admin/providers'],['Users','/admin/users']].map(([l,p]) => (
      <Link key={p} to={p} className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${active===p?'bg-saffron-500 text-white shadow-md':'bg-white border border-ink-200 text-ink-600 hover:border-saffron-300'}`}>{l}</Link>
    ))}
  </div>
);

const STATUS_CONFIG = {
  pending:     { label: 'Pending',     color: 'bg-amber-100 text-amber-700',   icon: '⏳' },
  accepted:    { label: 'Accepted',    color: 'bg-blue-100 text-blue-700',     icon: '✅' },
  traveling:   { label: 'Traveling',   color: 'bg-cyan-100 text-cyan-700',     icon: '🚗' },
  started:     { label: 'Started',     color: 'bg-violet-100 text-violet-700', icon: '🔧' },
  in_progress: { label: 'In Progress', color: 'bg-orange-100 text-orange-700', icon: '⚙️' },
  completed:   { label: 'Completed',   color: 'bg-green-100 text-green-700',   icon: '🎉' },
  cancelled:   { label: 'Cancelled',   color: 'bg-red-100 text-red-700',       icon: '❌' },
};

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [updating, setUpdating] = useState(null);

  const fetchBookings = async (status = filter) => {
    setLoading(true);
    try {
      const r = await bookingsAPI.getAll({ status: status || undefined, limit: 50 });
      setBookings(r.data.bookings || []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchBookings(); }, [filter]);

  // Admin can ONLY set status to "started" (when booking is in "traveling" state)
  // Admin can also cancel pending/accepted bookings
  const markStarted = async (id) => {
    setUpdating(id);
    try {
      await bookingsAPI.track(id, { status: 'started', note: 'Job started by admin' });
      setBookings(prev => prev.map(b => b._id === id ? { ...b, status: 'started' } : b));
      toast.success('Job marked as Started');
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to update'); }
    finally { setUpdating(null); }
  };

  const cancelBooking = async (id) => {
    if (!confirm('Cancel this booking?')) return;
    setUpdating(id);
    try {
      await bookingsAPI.cancel(id, { reason: 'Cancelled by admin' });
      setBookings(prev => prev.map(b => b._id === id ? { ...b, status: 'cancelled' } : b));
      toast.success('Booking cancelled');
    } catch (e) { toast.error(e.response?.data?.message || 'Cannot cancel at this stage'); }
    finally { setUpdating(null); }
  };

  return (
    <div className="page-container py-8 animate-fade-in">
      <AdminNav active="/admin/bookings" />
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-ink-900">Booking Management</h1>
        <p className="text-ink-500 mt-1">View all bookings. Admin action: mark as Started (when provider is traveling).</p>
      </div>

      {/* Role info banner */}
      <div className="bg-violet-50 border border-violet-200 rounded-2xl p-4 mb-6 text-sm text-violet-800">
        <p className="font-bold">Admin permissions:</p>
        <p>You can <strong>mark as Started</strong> (when provider is traveling) and <strong>cancel</strong> pending/accepted bookings.</p>
      </div>

      <div className="flex gap-2 mb-5 flex-wrap">
        {[['all','All','📋'],['pending','Pending','⏳'],['accepted','Accepted','✅'],['traveling','Traveling','🚗'],['started','Started','🔧'],['in_progress','In Progress','⚙️'],['completed','Completed','🎉'],['cancelled','Cancelled','❌']].map(([v,l,i]) => (
          <button key={v} onClick={() => setFilter(v === 'all' ? '' : v)}
            className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold transition-all ${(filter || 'all') === v ? 'bg-saffron-500 text-white shadow-md' : 'bg-white border border-ink-200 text-ink-600 hover:border-saffron-300'}`}>
            {i} {l}
          </button>
        ))}
      </div>

      {loading ? <LoadingSpinner fullPage /> : (
        <div className="card-flat overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-ink-50 border-b border-ink-100">
                <tr>{['ID','Customer','Service','Provider','Date','Amount','Status','Admin Action'].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-bold text-ink-500 uppercase tracking-wide">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-ink-50">
                {bookings.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-16 text-ink-400 font-medium">No bookings found</td></tr>
                ) : bookings.map(b => {
                  const sc = STATUS_CONFIG[b.status] || STATUS_CONFIG.pending;
                  return (
                    <tr key={b._id} className="hover:bg-ink-50 transition-colors">
                      <td className="py-3 px-4 font-mono text-xs text-ink-500">{b.bookingId?.slice(2, 14)}</td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-ink-800">{b.user?.name}</p>
                        <p className="text-xs text-ink-500">{b.user?.phone}</p>
                      </td>
                      <td className="py-3 px-4 text-ink-700 max-w-[120px]"><p className="truncate font-medium">{b.service?.name}</p></td>
                      <td className="py-3 px-4 text-ink-600 text-xs">{b.provider?.name || '—'}</td>
                      <td className="py-3 px-4">
                        <p className="text-ink-800 font-medium text-xs">{new Date(b.bookingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                        <p className="text-ink-500 text-xs">{b.timeSlot}</p>
                      </td>
                      <td className="py-3 px-4 font-bold text-saffron-500">₹{b.totalAmount?.toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${sc.color}`}>
                          {sc.icon} {sc.label}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2 flex-wrap">
                          {/* Admin can only mark as started when traveling */}
                          {b.status === 'traveling' && (
                            <button onClick={() => markStarted(b._id)} disabled={updating === b._id}
                              className="text-xs px-3 py-1.5 rounded-lg bg-violet-600 text-white hover:bg-violet-700 font-semibold disabled:opacity-50 transition-all">
                              {updating === b._id ? '...' : 'Mark Started'}
                            </button>
                          )}
                          {/* Admin can cancel pending or accepted */}
                          {['pending','accepted'].includes(b.status) && (
                            <button onClick={() => cancelBooking(b._id)} disabled={updating === b._id}
                              className="text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 font-semibold disabled:opacity-50 transition-all">
                              {updating === b._id ? '...' : 'Cancel'}
                            </button>
                          )}
                          {['completed','cancelled','in_progress','started'].includes(b.status) && (
                            <span className="text-xs text-ink-400 italic">
                              {b.status === 'in_progress' ? 'User completes' : b.status === 'started' ? 'Provider in progress' : 'Final'}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
