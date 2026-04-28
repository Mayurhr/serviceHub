import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { bookingsAPI, reviewsAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import ProviderAvatar from '../components/common/ProviderAvatar';

const STATUS_STEPS = [
  { key: 'pending',     icon: '⏳', label: 'Booking Pending',   desc: 'Awaiting provider acceptance.' },
  { key: 'accepted',    icon: '✅', label: 'Accepted',          desc: 'Provider accepted your booking.' },
  { key: 'traveling',   icon: '🚗', label: 'Provider On Way',   desc: 'Provider is traveling to your location.' },
  { key: 'started',     icon: '🔧', label: 'Work Started',      desc: 'Provider has arrived and started.' },
  { key: 'in_progress', icon: '⚙️', label: 'In Progress',       desc: 'Service is being performed.' },
  { key: 'completed',   icon: '🎉', label: 'Completed',         desc: 'Service completed successfully!' },
];

const ROLE_HINTS = {
  pending:     'Waiting for provider to accept',
  accepted:    'Provider will start traveling soon',
  traveling:   'Admin needs to mark as Started',
  started:     'Provider will begin work shortly',
  in_progress: 'You can mark as Completed once done',
  completed:   'Service is done! Leave a review below.',
};

export default function BookingStatusPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewDone, setReviewDone] = useState(false);

  useEffect(() => {
    bookingsAPI.getOne(id)
      .then(r => { setBooking(r.data); setReviewDone(r.data?.isReviewed); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const markCompleted = async () => {
    if (!confirm('Mark this booking as completed?')) return;
    setUpdating(true);
    try {
      await bookingsAPI.track(id, { status: 'completed', note: 'Marked completed by user' });
      setBooking(prev => ({ ...prev, status: 'completed', invoiceGenerated: true }));
      toast.success('Booking marked as completed!');
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to update'); }
    finally { setUpdating(false); }
  };

  const submitReview = async () => {
    if (!reviewForm.comment.trim()) return toast.error('Please write a review comment');
    setReviewSubmitting(true);
    try {
      await reviewsAPI.create({
        serviceId: booking.service?._id,
        providerId: booking.provider?._id,
        bookingId: id,
        rating: reviewForm.rating,
        comment: reviewForm.comment,
      });
      setReviewDone(true);
      setBooking(prev => ({ ...prev, isReviewed: true }));
      toast.success('Review submitted! Thank you.');
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to submit review'); }
    finally { setReviewSubmitting(false); }
  };

  if (loading) return <LoadingSpinner fullPage text="Loading booking..." />;
  if (!booking) return (
    <div className="text-center py-20">
      <h2 className="text-xl font-bold text-ink-900 mb-3">Booking not found</h2>
      <Link to="/my-bookings" className="btn-primary">My Bookings</Link>
    </div>
  );

  const isCancelled = booking.status === 'cancelled';
  const currentStepIndex = STATUS_STEPS.findIndex(s => s.key === booking.status);
  const currentStep = STATUS_STEPS[currentStepIndex] || STATUS_STEPS[0];
  const isUser = user?.role === 'user';

  return (
    <div className="page-container py-8 animate-fade-in max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Link to="/my-bookings" className="btn-secondary py-2 px-4 text-sm">← My Bookings</Link>
        <div>
          <h1 className="text-2xl font-extrabold text-ink-900">Booking Status</h1>
          <p className="text-ink-500 text-sm">#{booking.bookingId}</p>
        </div>
      </div>

      {isCancelled ? (
        <div className="card-flat p-8 text-center mb-6">
          <div className="text-5xl mb-4">❌</div>
          <h2 className="text-xl font-bold text-red-700 mb-2">Booking Cancelled</h2>
          {booking.cancelReason && <p className="text-ink-500 text-sm">Reason: {booking.cancelReason}</p>}
          <Link to="/services" className="btn-primary mt-4 inline-block">Book Again</Link>
        </div>
      ) : (
        <>
          {/* Current status banner */}
          <div className={`rounded-2xl p-6 text-center mb-8 ${
            booking.status === 'completed' ? 'bg-green-50 border border-green-200' : 'bg-saffron-50 border border-saffron-200'
          }`}>
            <div className="text-5xl mb-3">{currentStep.icon}</div>
            <h2 className={`text-2xl font-extrabold mb-2 ${booking.status === 'completed' ? 'text-green-700' : 'text-saffron-700'}`}>
              {currentStep.label}
            </h2>
            <p className="text-ink-600 text-sm">{currentStep.desc}</p>
            {ROLE_HINTS[booking.status] && (
              <p className="text-xs text-ink-400 mt-2 bg-white/70 rounded-lg px-3 py-1.5 inline-block">
                {ROLE_HINTS[booking.status]}
              </p>
            )}
          </div>

          {/* Progress steps */}
          <div className="card-flat p-6 mb-6">
            <h3 className="font-bold text-ink-900 mb-5">Service Progress</h3>
            <div className="space-y-3">
              {STATUS_STEPS.map((step, i) => {
                const isPast = i < currentStepIndex;
                const isCurrent = i === currentStepIndex;
                return (
                  <div key={step.key} className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-base shrink-0 font-bold transition-all
                      ${isPast ? 'bg-green-500 text-white' : isCurrent ? 'bg-saffron-500 text-white shadow-md' : 'bg-ink-100 text-ink-400'}`}>
                      {isPast ? '✓' : step.icon}
                    </div>
                    <div className="flex-1">
                      <p className={`font-semibold text-sm ${isCurrent ? 'text-saffron-600' : isPast ? 'text-green-700' : 'text-ink-400'}`}>
                        {step.label}
                      </p>
                      {isCurrent && <p className="text-ink-500 text-xs mt-0.5">{step.desc}</p>}
                    </div>
                    {isCurrent && <div className="w-2 h-2 bg-saffron-500 rounded-full animate-pulse shrink-0" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* User Action: Mark Completed */}
          {isUser && booking.status === 'in_progress' && (
            <div className="card-flat p-5 mb-6 bg-green-50 border border-green-200">
              <h3 className="font-bold text-green-800 mb-2">Is the work done?</h3>
              <p className="text-sm text-green-700 mb-3">If the provider has completed all the work, you can mark this booking as completed.</p>
              <button onClick={markCompleted} disabled={updating}
                className="w-full py-3 rounded-2xl bg-green-600 text-white font-bold hover:bg-green-700 transition-all disabled:opacity-50">
                {updating ? 'Updating...' : '✅ Mark as Completed'}
              </button>
            </div>
          )}
        </>
      )}

      {/* Booking details */}
      <div className="card-flat p-6 mb-6">
        <h3 className="font-bold text-ink-900 mb-4">Booking Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            ['Service', booking.service?.name],
            ['Date', booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' }) : '—'],
            ['Time', booking.timeSlot],
            ['Amount', '₹' + (booking.totalAmount?.toLocaleString() || '0')],
            ['Payment', booking.paymentMethod?.toUpperCase()],
            ['Address', booking.address],
          ].map(([label, value]) => (
            <div key={label} className="bg-ink-50 rounded-xl p-3">
              <p className="text-ink-400 text-xs">{label}</p>
              <p className="font-semibold text-ink-800 text-sm">{value || '—'}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Provider contact */}
      {booking.provider && (
        <div className="card-flat p-6 mb-6">
          <h3 className="font-bold text-ink-900 mb-3">Provider Details</h3>
          <div className="flex items-center gap-4">
            <ProviderAvatar provider={booking.provider} size="lg" />
            <div className="flex-1">
              <p className="font-bold text-ink-900">{booking.provider.name}</p>
              <p className="text-ink-500 text-sm">📞 {booking.provider.phone}</p>
              <p className="text-ink-500 text-sm">📍 {booking.provider.city}</p>
            </div>
            <a href={'tel:' + booking.provider.phone} className="btn-primary py-2.5 text-sm">📞 Call</a>
          </div>
        </div>
      )}

      {/* Review Section — shown after completion */}
      {booking.status === 'completed' && isUser && (
        <div className="card-flat p-6 mb-6">
          <h3 className="font-bold text-ink-900 mb-3">⭐ Leave a Review</h3>
          {reviewDone ? (
            <div className="text-center py-6 bg-green-50 rounded-2xl border border-green-200">
              <div className="text-3xl mb-2">🎉</div>
              <p className="font-bold text-green-700">Review Submitted!</p>
              <p className="text-sm text-green-600">Thank you for your feedback.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-ink-700 mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(r => (
                    <button key={r} onClick={() => setReviewForm(p => ({ ...p, rating: r }))}
                      className={`text-2xl transition-transform hover:scale-110 ${reviewForm.rating >= r ? 'text-amber-400' : 'text-ink-200'}`}>
                      ★
                    </button>
                  ))}
                  <span className="text-sm font-semibold text-ink-600 ml-2 mt-1">{reviewForm.rating}/5</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-ink-700 mb-2">Your Review *</label>
                <textarea rows={3} className="input-field resize-none"
                  placeholder="Share your experience with this service and provider..."
                  value={reviewForm.comment}
                  onChange={e => setReviewForm(p => ({ ...p, comment: e.target.value }))} />
              </div>
              <button onClick={submitReview} disabled={reviewSubmitting}
                className="btn-primary w-full py-3 disabled:opacity-50">
                {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Bottom actions */}
      <div className="flex gap-3">
        {(booking.status === 'completed' || booking.invoiceGenerated) && (
          <Link to={'/invoice/' + id} className="btn-primary flex-1 py-3 text-center">🧾 Invoice</Link>
        )}
        {booking.provider && (
          <Link to={'/chat/' + id} className="btn-secondary flex-1 py-3 text-center">💬 Chat</Link>
        )}
      </div>
    </div>
  );
}
