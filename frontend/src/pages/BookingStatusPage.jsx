import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { bookingsAPI } from '../utils/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const STATUS_STEPS = [
  { key: 'pending',     icon: '⏳', label: 'Booking Pending',  desc: 'Your booking is awaiting confirmation from the provider.' },
  { key: 'accepted',    icon: '✅', label: 'Booking Accepted', desc: 'Your booking has been accepted by the provider.' },
  { key: 'started',     icon: '🔧', label: 'Work Started',     desc: 'The provider has arrived and started the service.' },
  { key: 'in_progress', icon: '⚙️', label: 'In Progress',      desc: 'Service is currently being performed.' },
  { key: 'completed',   icon: '🎉', label: 'Completed',        desc: 'Service has been completed successfully!' },
];

export default function BookingStatusPage() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bookingsAPI.getOne(id)
      .then(r => setBooking(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

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
          <Link to="/services" className="btn-primary mt-4">Book Again</Link>
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
          </div>

          {/* Progress steps */}
          <div className="card-flat p-6 mb-6">
            <h3 className="font-bold text-ink-900 mb-5">Progress</h3>
            <div className="space-y-4">
              {STATUS_STEPS.map((step, i) => {
                const isPast = i < currentStepIndex;
                const isCurrent = i === currentStepIndex;
                return (
                  <div key={step.key} className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-base shrink-0 font-bold
                      ${isPast ? 'bg-green-500 text-white' : isCurrent ? 'bg-saffron-500 text-white' : 'bg-ink-100 text-ink-400'}`}>
                      {isPast ? '✓' : step.icon}
                    </div>
                    <div className="flex-1">
                      <p className={`font-semibold text-sm ${isCurrent ? 'text-saffron-600' : isPast ? 'text-green-700' : 'text-ink-400'}`}>
                        {step.label}
                      </p>
                      {isCurrent && <p className="text-ink-500 text-xs mt-0.5">{step.desc}</p>}
                    </div>
                    {isCurrent && (
                      <div className="w-2 h-2 bg-saffron-500 rounded-full animate-pulse shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
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
            ['Amount', `₹${booking.totalAmount?.toLocaleString()}`],
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
            <img
              src={booking.provider.avatar || `https://i.pravatar.cc/60?u=${booking.provider._id}`}
              alt={booking.provider.name}
              className="w-14 h-14 rounded-xl object-cover"
              onError={e => { e.target.src = `https://i.pravatar.cc/60?u=${booking.provider._id}`; }}
            />
            <div className="flex-1">
              <p className="font-bold text-ink-900">{booking.provider.name}</p>
              <p className="text-ink-500 text-sm">📞 {booking.provider.phone}</p>
              <p className="text-ink-500 text-sm">📍 {booking.provider.city}</p>
            </div>
            <a href={`tel:${booking.provider.phone}`} className="btn-primary py-2.5 text-sm">
              📞 Call
            </a>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        {booking.status === 'completed' && (
          <Link to={`/invoice/${id}`} className="btn-primary flex-1 py-3 text-center">
            🧾 View Invoice
          </Link>
        )}
        {booking.provider && (
          <Link to={`/chat/${id}`} className="btn-secondary flex-1 py-3 text-center">
            💬 Chat with Provider
          </Link>
        )}
      </div>
    </div>
  );
}
