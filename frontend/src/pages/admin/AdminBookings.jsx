import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingsAPI } from '../../utils/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const AdminNav = ({ active }) => (
  <div className="flex gap-2 flex-wrap mb-8">
    {[['📊 Dashboard','/admin'],['🛠️ Services','/admin/services'],['👥 Providers','/admin/providers'],['📅 Bookings','/admin/bookings'],['👤 Users','/admin/users']].map(([l,p]) => (
      <Link key={p} to={p} className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${active===p?'bg-saffron-500 text-white shadow-md':'bg-white border border-ink-200 text-ink-600 hover:border-saffron-300'}`}>{l}</Link>
    ))}
  </div>
);

const SC = { pending:'status-pending',accepted:'status-accepted',traveling:'status-traveling',started:'status-started',in_progress:'status-in_progress',completed:'status-completed',cancelled:'status-cancelled' };

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [updating, setUpdating] = useState(null);

  const fetch = async (status = filter) => {
    setLoading(true);
    try {
      const r = await bookingsAPI.getAll({ status: status || undefined, limit: 50 });
      setBookings(r.data.bookings || []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, [filter]);

  const updateStatus = async (id, status) => {
    setUpdating(id);
    try {
      await bookingsAPI.track(id, { status, note: `Status changed to ${status} by admin` });
      setBookings(prev => prev.map(b => b._id === id ? { ...b, status } : b));
      toast.success(`Updated to ${status}`);
    } catch { toast.error('Failed'); } finally { setUpdating(null); }
  };

  return (
    <div className="page-container py-8 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-ink-900">Manage Bookings</h1>
        <p className="text-ink-500 mt-1">View and update all platform bookings</p>
      </div>
      <AdminNav active="/admin/bookings" />

      <div className="flex gap-2 mb-5 flex-wrap">
        {[['all','All','📋'],['pending','Pending','⏳'],['accepted','Accepted','✅'],['traveling','Traveling','🚗'],['in_progress','In Progress','⚙️'],['completed','Completed','🎉'],['cancelled','Cancelled','❌']].map(([v,l,i]) => (
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
                <tr>{['ID','Customer','Service','Provider','Date','Amount','Status','Actions'].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-bold text-ink-500 uppercase tracking-wide">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-ink-50">
                {bookings.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-16 text-ink-400 font-medium">No bookings found</td></tr>
                ) : bookings.map(b => (
                  <tr key={b._id} className="hover:bg-ink-50 transition-colors">
                    <td className="py-3 px-4 font-mono text-xs text-ink-500">{b.bookingId?.slice(2, 14)}</td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-ink-800">{b.user?.name}</p>
                      <p className="text-xs text-ink-500">{b.user?.phone}</p>
                    </td>
                    <td className="py-3 px-4 text-ink-700 max-w-[120px]"><p className="truncate font-medium">{b.service?.name}</p></td>
                    <td className="py-3 px-4 text-ink-600 text-xs">{b.provider?.name || '—'}</td>
                    <td className="py-3 px-4">
                      <p className="text-ink-800 font-medium text-xs">{new Date(b.bookingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      <p className="text-ink-500 text-xs">{b.timeSlot}</p>
                    </td>
                    <td className="py-3 px-4 font-bold text-saffron-500">₹{b.totalAmount?.toLocaleString()}</td>
                    <td className="py-3 px-4"><span className={`badge ${SC[b.status] || 'status-pending'} text-[10px]`}>{b.status?.replace('_', ' ')}</span></td>
                    <td className="py-3 px-4">
                      {!['completed', 'cancelled'].includes(b.status) ? (
                        <select disabled={updating === b._id} value={b.status}
                          onChange={e => updateStatus(b._id, e.target.value)}
                          className="text-xs border border-ink-200 rounded-lg px-2 py-1.5 text-ink-700 focus:border-saffron-400 outline-none cursor-pointer disabled:opacity-50">
                          <option value="pending">⏳ Pending</option>
                          <option value="accepted">✅ Accept</option>
                          <option value="traveling">🚗 Traveling</option>
                          <option value="started">🔧 Started</option>
                          <option value="in_progress">⚙️ In Progress</option>
                          <option value="completed">🎉 Complete</option>
                          <option value="cancelled">❌ Cancel</option>
                        </select>
                      ) : <span className="text-xs text-ink-400 italic">Final</span>}
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
