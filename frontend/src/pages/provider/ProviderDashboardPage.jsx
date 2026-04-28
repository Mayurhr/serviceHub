import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { providersAPI, bookingsAPI, reviewsAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StarRating from '../../components/common/StarRating';
import TrustScore from '../../components/common/TrustScore';
import { getInitials, avatarStyle } from '../../utils/avatar';
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

const getProviderNextStatus = (s) => {
  if (s === 'pending')  return { label: 'Accept Booking',  next: 'accepted',    color: 'bg-blue-600 hover:bg-blue-700' };
  if (s === 'accepted') return { label: 'Start Traveling', next: 'traveling',   color: 'bg-cyan-600 hover:bg-cyan-700' };
  if (s === 'started')  return { label: 'Begin Work',      next: 'in_progress', color: 'bg-orange-600 hover:bg-orange-700' };
  return null;
};

export default function ProviderDashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [updating, setUpdating] = useState(null);
  const [tab, setTab] = useState('bookings'); // 'bookings' | 'reviews'
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  useEffect(() => {
    providersAPI.getDashboard()
      .then(r => setData(r.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  const loadReviews = async (serviceSlug) => {
    if (!serviceSlug) return;
    setReviewsLoading(true);
    try {
      // Gather all reviews for all services this provider handles
      const r = await reviewsAPI.getForService(serviceSlug);
      setReviews(r.data || []);
    } catch {} finally { setReviewsLoading(false); }
  };

  // Load reviews when tab switches - use provider's first service slug
  useEffect(() => {
    if (tab === 'reviews' && data?.provider) {
      // Get all bookings and find completed ones to extract service reviews
      // We'll fetch reviews per service from completed bookings
      const completedBookings = (data.bookings || []).filter(b => b.status === 'completed');
      const slugsSeen = new Set();
      const fetchAll = async () => {
        setReviewsLoading(true);
        const all = [];
        for (const b of completedBookings) {
          const slug = b.service?.slug;
          if (slug && !slugsSeen.has(slug)) {
            slugsSeen.add(slug);
            try {
              const r = await reviewsAPI.getForService(slug);
              // Filter to only reviews for this provider
              const mine = (r.data || []).filter(rv =>
                rv.provider?.toString() === data.provider._id?.toString() ||
                !rv.provider
              );
              all.push(...mine);
            } catch {}
          }
        }
        setReviews(all);
        setReviewsLoading(false);
      };
      fetchAll();
    }
  }, [tab, data]);

  const updateStatus = async (bookingId, next) => {
    setUpdating(bookingId);
    try {
      await bookingsAPI.track(bookingId, { status: next, note: 'Updated by provider' });
      setData(prev => ({
        ...prev,
        bookings: prev.bookings.map(b => b._id === bookingId ? { ...b, status: next } : b),
      }));
      toast.success('Status updated!');
    } catch (e) { toast.error(e.response?.data?.message || 'Update failed'); }
    finally { setUpdating(null); }
  };

  if (loading) return <LoadingSpinner fullPage text="Loading dashboard..." />;
  if (!data) return <div className="page-container py-8"><p>Could not load dashboard.</p></div>;

  const { bookings = [], provider, totalEarnings = 0, counts = {} } = data;
  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="page-container py-8 animate-fade-in">

        {/* Provider Profile Header */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 mb-6 flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-extrabold text-white shrink-0 shadow-lg"
            style={avatarStyle(provider?.name || '')}>
            {getInitials(provider?.name || '')}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl font-extrabold text-slate-900">{provider?.name}</h1>
            <p className="text-slate-500 text-sm">{provider?.email} · 📍 {provider?.city}</p>
            <div className="flex items-center gap-3 mt-2 flex-wrap justify-center sm:justify-start">
              <StarRating rating={provider?.rating || 0} size="md" showCount count={provider?.numReviews} />
              <TrustScore score={provider?.trustScore || 0} />
              {provider?.isVerified && <span className="badge badge-verified">✓ Verified</span>}
            </div>
          </div>
          <div className="shrink-0">
            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold ${
              provider?.availabilityStatus === 'online' ? 'bg-green-100 text-green-700' :
              provider?.availabilityStatus === 'busy' ? 'bg-amber-100 text-amber-700' :
              'bg-slate-100 text-slate-600'}`}>
              <span className={`w-2 h-2 rounded-full ${
                provider?.availabilityStatus === 'online' ? 'bg-green-500 animate-pulse' :
                provider?.availabilityStatus === 'busy' ? 'bg-amber-500' : 'bg-slate-400'}`} />
              {provider?.availabilityStatus || 'offline'}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { l: 'Total Bookings', v: bookings.length,               i: '📋', from: '#f97316', to: '#ea580c' },
            { l: 'Completed',      v: provider?.completedJobs || 0,  i: '🎉', from: '#10b981', to: '#059669' },
            { l: 'Earnings',       v: '₹' + totalEarnings.toLocaleString(), i: '💰', from: '#8b5cf6', to: '#7c3aed' },
            { l: 'Reviews',        v: provider?.numReviews || 0,     i: '⭐', from: '#f59e0b', to: '#d97706' },
          ].map((s, i) => (
            <div key={i} className="rounded-2xl p-5 text-white shadow-md"
              style={{ background: `linear-gradient(135deg, ${s.from}, ${s.to})` }}>
              <div className="flex justify-between items-start mb-2">
                <span className="text-white/70 text-sm font-medium">{s.l}</span>
                <span className="text-2xl">{s.i}</span>
              </div>
              <div className="text-2xl font-extrabold">{s.v}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5">
          {[['bookings','📋 Bookings'],['reviews','⭐ My Reviews']].map(([val, label]) => (
            <button key={val} onClick={() => setTab(val)}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                tab === val
                  ? 'bg-slate-800 text-white shadow-md'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'}`}>
              {label}
            </button>
          ))}
        </div>

        {/* BOOKINGS TAB */}
        {tab === 'bookings' && (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
            {/* Permission info */}
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-3 mb-5 text-xs text-blue-700">
              <strong>Your actions:</strong> Pending → Accept → Traveling → (Admin starts) → Begin Work → (User marks complete)
            </div>

            {/* Filter pills */}
            <div className="flex gap-2 flex-wrap mb-5">
              {['all','pending','accepted','traveling','started','in_progress','completed','cancelled'].map(v => (
                <button key={v} onClick={() => setFilter(v)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-full transition-all capitalize ${
                    filter === v ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                  {v.replace('_', ' ')}
                </button>
              ))}
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-14">
                <div className="text-5xl mb-3">📅</div>
                <p className="text-slate-400">No {filter === 'all' ? '' : filter} bookings.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map(b => {
                  const sc = STATUS_CONFIG[b.status] || STATUS_CONFIG.pending;
                  const nextAction = getProviderNextStatus(b.status);
                  return (
                    <div key={b._id} className="border border-slate-100 hover:border-slate-200 rounded-2xl p-4 transition-all hover:shadow-sm">
                      <div className="flex flex-col sm:flex-row gap-4">
                        <img
                          src={b.service?.images?.[0] || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=150'}
                          className="w-full sm:w-20 h-16 sm:h-20 object-cover rounded-xl shrink-0"
                          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=100'; }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between flex-wrap gap-2 mb-1">
                            <div>
                              <h3 className="font-bold text-slate-900">{b.service?.name}</h3>
                              <p className="text-slate-400 text-xs font-mono">{b.bookingId}</p>
                            </div>
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${sc.color}`}>
                              {sc.icon} {sc.label}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-3 text-sm text-slate-600 mb-1">
                            <span>📅 {new Date(b.bookingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                            <span>🕐 {b.timeSlot}</span>
                            <span className="font-bold text-orange-500">₹{b.totalAmount?.toLocaleString()}</span>
                          </div>
                          <p className="text-xs text-slate-500">👤 {b.user?.name} · 📞 {b.user?.phone}</p>
                          <p className="text-xs text-slate-500 truncate">📍 {b.address}</p>

                          <div className="flex gap-2 mt-3 flex-wrap">
                            {nextAction && (
                              <button onClick={() => updateStatus(b._id, nextAction.next)}
                                disabled={updating === b._id}
                                className={`text-sm px-4 py-2 rounded-xl text-white font-bold transition-all disabled:opacity-50 ${nextAction.color}`}>
                                {updating === b._id ? '...' : nextAction.label}
                              </button>
                            )}
                            <Link to={`/provider/chat/${b._id}`}
                              className="text-sm px-4 py-2 rounded-xl border-2 border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600 font-semibold transition-all">
                              💬 Chat
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* REVIEWS TAB */}
        {tab === 'reviews' && (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-extrabold text-slate-900 text-lg">Customer Reviews</h2>
              <div className="flex items-center gap-2">
                <span className="text-amber-500 text-xl">★</span>
                <span className="font-bold text-slate-800">{provider?.rating?.toFixed(1) || '—'}</span>
                <span className="text-slate-400 text-sm">({provider?.numReviews || 0} reviews)</span>
              </div>
            </div>

            {reviewsLoading ? (
              <LoadingSpinner text="Loading reviews..." />
            ) : reviews.length === 0 ? (
              <div className="text-center py-14">
                <div className="text-5xl mb-3">⭐</div>
                <p className="text-slate-400 font-medium">No reviews yet</p>
                <p className="text-slate-300 text-sm mt-1">Reviews appear here after customers complete bookings</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((rv, i) => (
                  <div key={rv._id || i} className="border border-slate-100 rounded-2xl p-4 hover:border-amber-100 transition-all">
                    <div className="flex items-start gap-3">
                      {/* User initials avatar */}
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-extrabold text-sm shrink-0"
                        style={avatarStyle(rv.user?.name || 'U')}>
                        {getInitials(rv.user?.name || 'U')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <p className="font-bold text-slate-800 text-sm">{rv.user?.name || 'Customer'}</p>
                          <p className="text-xs text-slate-400">{new Date(rv.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                        </div>
                        <div className="flex mb-2">
                          {[1,2,3,4,5].map(s => (
                            <span key={s} className={`text-base ${s <= rv.rating ? 'text-amber-400' : 'text-slate-200'}`}>★</span>
                          ))}
                        </div>
                        <p className="text-slate-600 text-sm leading-relaxed">{rv.comment}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
