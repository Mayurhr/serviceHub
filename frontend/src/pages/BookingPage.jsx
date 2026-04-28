import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { servicesAPI, providersAPI, bookingsAPI, ALLOWED_CITIES } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import TrustScore from '../components/common/TrustScore';
import ProviderAvatar from '../components/common/ProviderAvatar';
import toast from 'react-hot-toast';

/* ── UPI QR ── */
const UpiQR = ({ amount }) => {
  const upiId = 'servease@upi';
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(`upi://pay?pa=${upiId}&pn=ServeEase&am=${amount}&cu=INR`)}`;
  return (
    <div className="flex flex-col items-center gap-3 p-5 bg-violet-50 rounded-2xl border border-violet-200">
      <p className="text-sm font-bold text-violet-700">Scan to Pay via UPI</p>
      <img src={qrUrl} alt="UPI QR" className="w-44 h-44 rounded-xl border-2 border-violet-200 shadow" />
      <p className="text-xs text-slate-500">UPI ID: <span className="font-bold text-slate-800">{upiId}</span></p>
      <p className="text-lg font-extrabold text-violet-700">₹{amount.toLocaleString()}</p>
      <p className="text-xs text-slate-400">PhonePe · GPay · Paytm · BHIM</p>
    </div>
  );
};

/* ── Step indicator ── */
const STEPS = [
  { icon: '👤', label: 'Provider' },
  { icon: '📅', label: 'Date & Time' },
  { icon: '📋', label: 'Details' },
  { icon: '✅', label: 'Confirm' },
];

const StepBar = ({ step }) => (
  <div className="flex items-center justify-center gap-0 mb-10">
    {STEPS.map((s, i) => (
      <div key={i} className="flex items-center">
        <div className="flex flex-col items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-base font-extrabold transition-all duration-300
            ${i < step  ? 'bg-green-500 text-white shadow-md' :
              i === step ? 'bg-orange-500 text-white shadow-lg shadow-orange-200 scale-110' :
                           'bg-slate-100 text-slate-400'}`}>
            {i < step ? '✓' : s.icon}
          </div>
          <span className={`text-[11px] mt-1.5 font-semibold tracking-wide
            ${i === step ? 'text-orange-500' : i < step ? 'text-green-600' : 'text-slate-400'}`}>
            {s.label}
          </span>
        </div>
        {i < STEPS.length - 1 && (
          <div className={`w-12 md:w-20 h-0.5 mx-1 mb-5 transition-all ${i < step ? 'bg-green-400' : 'bg-slate-200'}`} />
        )}
      </div>
    ))}
  </div>
);

export default function BookingPage() {
  const { slug } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [service, setService]             = useState(null);
  const [loading, setLoading]             = useState(true);
  const [step, setStep]                   = useState(0);
  const [providers, setProviders]         = useState([]);
  const [matchLoading, setMatchLoading]   = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [aiUsed, setAiUsed]              = useState(false);
  const [bundleServices, setBundleServices] = useState([]);
  const [allServices, setAllServices]     = useState([]);
  const [submitting, setSubmitting]       = useState(false);
  const [upiPaid, setUpiPaid]            = useState(false);
  const [showQR, setShowQR]              = useState(false);

  const [form, setForm] = useState({
    bookingDate: '', timeSlot: '',
    city: user?.city || 'Davanagere',
    address: user?.address || '',
    phone: user?.phone || '',
    notes: '', paymentMethod: 'cash',
  });

  useEffect(() => {
    Promise.all([servicesAPI.getOne(slug), servicesAPI.getAll({ limit: 20 })])
      .then(([s, all]) => { setService(s.data); setAllServices((all.data.services || []).filter(x => x.slug !== slug)); })
      .catch(() => {}).finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => { if (service) runAiMatch(form.city); }, [service]);

  const runAiMatch = async (city) => {
    setMatchLoading(true);
    try {
      const res = await providersAPI.smartMatch({ serviceId: service._id, budget: service.priceRange?.min, urgency: 'normal', userCity: city || form.city });
      setProviders(res.data.providers || []); setAiUsed(true);
      toast.success('AI Match complete!');
    } catch {
      const r = await providersAPI.getAll({ serviceId: service._id, city: city || form.city, limit: 12 });
      setProviders(r.data || []);
    } finally { setMatchLoading(false); }
  };

  const loadAll = async (city) => {
    setMatchLoading(true);
    try { const r = await providersAPI.getAll({ serviceId: service._id, city: city || form.city, limit: 15 }); setProviders(r.data || []); setAiUsed(false); }
    catch {} finally { setMatchLoading(false); }
  };

  const mainPrice   = service?.priceRange?.min || 0;
  const bundleTotal = bundleServices.reduce((s, id) => s + (allServices.find(x => x._id === id)?.priceRange?.min || 0), mainPrice);
  const discRate    = bundleServices.length >= 2 ? 0.15 : bundleServices.length === 1 ? 0.10 : 0;
  const discAmount  = bundleServices.length > 0 ? Math.round(bundleTotal * discRate) : 0;
  const totalAmount = bundleTotal - discAmount;

  const handleSubmit = async () => {
    if (form.paymentMethod === 'upi' && !upiPaid) return toast.error('Mark UPI payment as paid first');
    if (!form.address.trim()) return toast.error('Enter service address');
    if (!form.phone.trim()) return toast.error('Enter phone number');
    setSubmitting(true);
    try {
      await bookingsAPI.create({
        serviceId: service._id, providerId: selectedProvider?._id || null,
        bundleServices, isBundleBooking: bundleServices.length > 0,
        bookingDate: form.bookingDate, timeSlot: form.timeSlot,
        address: `${form.address}, ${form.city}`, phone: form.phone,
        notes: form.notes, paymentMethod: form.paymentMethod, aiMatchUsed: aiUsed, city: form.city,
      });
      toast.success('Booking confirmed!');
      navigate('/my-bookings');
    } catch (e) { toast.error(e.response?.data?.message || 'Booking failed'); }
    finally { setSubmitting(false); }
  };

  if (loading) return <LoadingSpinner fullPage text="Loading service..." />;
  if (!service) return <div className="text-center py-20"><h2 className="text-xl font-bold">Service not found</h2></div>;

  const minDate = new Date(); minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30">
      <div className="page-container py-8 animate-fade-in">

        {/* Page header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-100 text-orange-600 text-xs font-bold px-4 py-1.5 rounded-full mb-3">
            {service.category?.emoji} {service.category?.name}
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-1">Book: {service.name}</h1>
          <p className="text-slate-400 text-sm">Complete in 4 simple steps · No hidden charges</p>
        </div>

        {/* Step bar */}
        <StepBar step={step} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Panel */}
          <div className="lg:col-span-2">
            <div className="step-card">

              {/* ─── STEP 0: Provider ─── */}
              {step === 0 && (
                <div className="animate-fade-in">
                  <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                    <div>
                      <h2 className="text-xl font-extrabold text-slate-900">Choose a Provider</h2>
                      <p className="text-slate-400 text-sm mt-0.5">AI-ranked by rating & proximity to you</p>
                    </div>
                    <div className="flex gap-2 items-center flex-wrap">
                      <select
                        className="text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-700 font-semibold focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none"
                        value={form.city}
                        onChange={e => { setForm(p => ({ ...p, city: e.target.value })); runAiMatch(e.target.value); }}>
                        {ALLOWED_CITIES.map(c => <option key={c}>{c}</option>)}
                      </select>
                      <button onClick={() => runAiMatch(form.city)} className="btn-primary text-xs py-2 px-3">🤖 Re-match</button>
                      <button onClick={() => loadAll(form.city)} className="btn-secondary text-xs py-2 px-3">All</button>
                    </div>
                  </div>

                  {aiUsed && (
                    <div className="flex items-center gap-2 bg-violet-50 border border-violet-100 rounded-xl px-4 py-2.5 mb-4 text-sm text-violet-700">
                      <span className="text-base">🤖</span>
                      <span><strong>AI Smart Match</strong> — Ranked for <strong>{form.city}</strong></span>
                    </div>
                  )}

                  {matchLoading ? (
                    <div className="py-12"><LoadingSpinner text="Finding best providers near you..." /></div>
                  ) : providers.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-4xl mb-3">🔍</div>
                      <p className="text-slate-500 mb-3">No providers found in {form.city}</p>
                      <button onClick={() => loadAll('')} className="btn-secondary text-sm">Show all cities</button>
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1 scrollbar-hide">
                      {providers.map(p => (
                        <div key={p._id}
                          onClick={() => setSelectedProvider(prev => prev?._id === p._id ? null : p)}
                          className={`provider-slot ${selectedProvider?._id === p._id ? 'provider-slot-selected' : ''}`}>
                          <div className="flex items-center gap-3">
                            <ProviderAvatar provider={p} size="md" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <h3 className="font-bold text-slate-900 truncate">{p.name}</h3>
                                <TrustScore score={p.trustScore} showLabel={false} />
                              </div>
                              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                <span className="text-slate-500 text-xs">{p.experience} yrs · 📍 {p.city}</span>
                                <span className="text-amber-500 text-xs font-bold">★ {p.rating?.toFixed(1)}</span>
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${p.availabilityStatus === 'online' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                  {p.availabilityStatus}
                                </span>
                              </div>
                            </div>
                          </div>
                          {p.matchScore && (
                            <div className="mt-2 bg-white rounded-lg px-3 py-1 flex items-center justify-between border border-orange-100">
                              <span className="text-xs text-slate-500">AI Match Score</span>
                              <span className="font-extrabold text-orange-500 text-sm">{p.matchScore}%</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <p className="text-xs text-slate-400 mt-3 text-center">
                    {selectedProvider ? `✓ Selected: ${selectedProvider.name}` : 'Skip to auto-assign nearest available provider'}
                  </p>
                  <button onClick={() => setStep(1)} className="btn-primary w-full py-3 mt-4 text-base font-bold">
                    {selectedProvider ? `Continue with ${selectedProvider.name.split(' ')[0]} →` : 'Continue (Auto-assign) →'}
                  </button>
                </div>
              )}

              {/* ─── STEP 1: Date & Time ─── */}
              {step === 1 && (
                <div className="animate-fade-in">
                  <h2 className="text-xl font-extrabold text-slate-900 mb-1">Pick a Date & Time</h2>
                  <p className="text-slate-400 text-sm mb-6">Select when you'd like the service</p>

                  <div className="mb-6">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Preferred Date *</label>
                    <input type="date" className="input-field" min={minDateStr} value={form.bookingDate}
                      onChange={e => setForm(p => ({ ...p, bookingDate: e.target.value, timeSlot: '' }))} />
                  </div>

                  {form.bookingDate && (
                    <div className="mb-6 animate-fade-in">
                      <label className="block text-sm font-bold text-slate-700 mb-3">Select Time Slot *</label>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {service.timeSlots?.filter(s => s.available).map((slot, i) => (
                          <button key={i} type="button"
                            onClick={() => setForm(p => ({ ...p, timeSlot: slot.time }))}
                            className={`py-2.5 px-2 rounded-xl text-sm font-bold border-2 transition-all
                              ${form.timeSlot === slot.time ? 'time-btn-active' : 'time-btn'}`}>
                            {slot.time}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bundle */}
                  <div className="bg-violet-50/60 rounded-2xl p-4 border border-violet-100">
                    <h3 className="font-bold text-slate-800 mb-0.5 flex items-center gap-2">
                      📦 Bundle & Save
                      {bundleServices.length > 0 && (
                        <span className="text-xs font-semibold bg-violet-200 text-violet-700 px-2 py-0.5 rounded-full">
                          {bundleServices.length >= 2 ? '15% OFF' : '10% OFF'}
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-500 mb-3">Add more services to save automatically</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto scrollbar-hide">
                      {allServices.slice(0, 12).map(s => (
                        <label key={s._id} className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all text-xs
                          ${bundleServices.includes(s._id) ? 'border-violet-400 bg-violet-100' : 'border-slate-200 hover:border-violet-200 bg-white'}`}>
                          <input type="checkbox" className="accent-violet-500 shrink-0"
                            checked={bundleServices.includes(s._id)}
                            onChange={e => setBundleServices(prev => e.target.checked ? [...prev, s._id] : prev.filter(id => id !== s._id))} />
                          <span className="font-semibold text-slate-700 flex-1 truncate">{s.name}</span>
                          <span className="text-violet-600 font-bold shrink-0">₹{s.priceRange?.min}</span>
                        </label>
                      ))}
                    </div>
                    {bundleServices.length > 0 && (
                      <div className="mt-3 bg-white rounded-xl p-3 text-sm space-y-1">
                        <div className="flex justify-between text-slate-500"><span>Subtotal</span><span>₹{bundleTotal.toLocaleString()}</span></div>
                        <div className="flex justify-between text-green-600 font-semibold"><span>Discount ({bundleServices.length >= 2 ? '15' : '10'}%)</span><span>−₹{discAmount.toLocaleString()}</span></div>
                        <div className="flex justify-between font-extrabold text-slate-900 pt-1 border-t border-slate-100"><span>Total</span><span className="text-orange-500">₹{totalAmount.toLocaleString()}</span></div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button onClick={() => setStep(0)} className="btn-secondary flex-1 py-3">← Back</button>
                    <button onClick={() => { if (!form.bookingDate) return toast.error('Select a date'); if (!form.timeSlot) return toast.error('Select a time slot'); setStep(2); }} className="btn-primary flex-1 py-3">Continue →</button>
                  </div>
                </div>
              )}

              {/* ─── STEP 2: Details ─── */}
              {step === 2 && (
                <div className="animate-fade-in">
                  <h2 className="text-xl font-extrabold text-slate-900 mb-1">Your Details</h2>
                  <p className="text-slate-400 text-sm mb-6">Tell us where to send the provider</p>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">📍 Your City *</label>
                        <select className="input-field" value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))}>
                          {ALLOWED_CITIES.map(c => <option key={c}>{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">📱 Phone *</label>
                        <input type="tel" className="input-field" placeholder="Your contact number" value={form.phone}
                          onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">🏠 Service Address *</label>
                      <textarea rows={2} className="input-field resize-none" placeholder="Street, area, landmark..."
                        value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} />
                      {form.address && <p className="text-xs text-slate-400 mt-1">Full: {form.address}, {form.city}</p>}
                    </div>

                    {/* Payment — Cash or UPI only */}
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-3">💳 Payment Method</label>
                      <div className="grid grid-cols-2 gap-3">
                        {[['cash','💵','Cash','Pay after service','After completion'],['upi','📱','UPI','Pay now via QR','Instant & secure']].map(([v,icon,label,sub,badge]) => (
                          <button key={v} type="button"
                            onClick={() => { setForm(p => ({ ...p, paymentMethod: v })); setUpiPaid(false); setShowQR(false); }}
                            className={`p-4 rounded-2xl border-2 text-left transition-all hover:shadow-md
                              ${form.paymentMethod === v ? 'border-orange-400 bg-orange-50 shadow-md shadow-orange-100' : 'border-slate-200 hover:border-orange-200'}`}>
                            <div className="text-2xl mb-2">{icon}</div>
                            <p className="font-bold text-slate-900 text-sm">{label}</p>
                            <p className="text-xs text-slate-500">{sub}</p>
                            <span className={`mt-2 inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${form.paymentMethod === v ? 'bg-orange-200 text-orange-700' : 'bg-slate-100 text-slate-500'}`}>{badge}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">📝 Notes (Optional)</label>
                      <textarea rows={2} className="input-field resize-none" placeholder="Any specific requirements..."
                        value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button onClick={() => setStep(1)} className="btn-secondary flex-1 py-3">← Back</button>
                    <button onClick={() => { if (!form.address.trim()) return toast.error('Enter address'); if (!form.phone.trim()) return toast.error('Enter phone'); setStep(3); }} className="btn-primary flex-1 py-3">Continue →</button>
                  </div>
                </div>
              )}

              {/* ─── STEP 3: Confirm ─── */}
              {step === 3 && (
                <div className="animate-fade-in">
                  <h2 className="text-xl font-extrabold text-slate-900 mb-1">Review & Confirm</h2>
                  <p className="text-slate-400 text-sm mb-5">Double-check your booking details</p>

                  {/* Summary card */}
                  <div className="bg-slate-50 rounded-2xl p-5 space-y-3 mb-5 border border-slate-100">
                    {[
                      ['🔧 Service',  service.name],
                      ['👤 Provider', selectedProvider ? `${selectedProvider.name} (${selectedProvider.city})` : 'Auto-assigned — nearest available'],
                      ['📅 Date',     form.bookingDate ? new Date(form.bookingDate).toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' }) : '—'],
                      ['🕐 Time',     form.timeSlot],
                      ['📍 City',     form.city],
                      ['🏠 Address',  form.address],
                      ['📱 Phone',    form.phone],
                      ['💳 Payment',  form.paymentMethod === 'upi' ? 'UPI (QR)' : 'Cash on service'],
                    ].map(([l, v]) => (
                      <div key={l} className="flex justify-between gap-3">
                        <span className="text-slate-500 text-sm shrink-0">{l}</span>
                        <span className="text-slate-900 text-sm font-semibold text-right">{v}</span>
                      </div>
                    ))}
                    <div className="pt-3 border-t border-slate-200 space-y-1">
                      <div className="flex justify-between text-sm"><span className="text-slate-500">Services total</span><span className="font-semibold">₹{bundleTotal.toLocaleString()}</span></div>
                      {discAmount > 0 && <div className="flex justify-between text-sm text-green-600 font-semibold"><span>Bundle discount</span><span>−₹{discAmount.toLocaleString()}</span></div>}
                      <div className="flex justify-between font-extrabold text-lg pt-1 border-t border-slate-200">
                        <span className="text-slate-900">Total Payable</span>
                        <span className="text-orange-500">₹{totalAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* UPI payment */}
                  {form.paymentMethod === 'upi' && (
                    <div className="mb-5">
                      {!showQR ? (
                        <button onClick={() => setShowQR(true)}
                          className="w-full py-3 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white font-bold transition-all">
                          📱 Show UPI QR Code — ₹{totalAmount.toLocaleString()}
                        </button>
                      ) : (
                        <div className="animate-scale-in">
                          <UpiQR amount={totalAmount} />
                          {!upiPaid ? (
                            <button onClick={() => { setUpiPaid(true); toast.success('Payment marked as paid!'); }}
                              className="w-full py-3 mt-3 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-bold transition-all">
                              ✅ Mark as Paid
                            </button>
                          ) : (
                            <div className="flex items-center justify-center gap-2 mt-3 p-3 bg-green-50 border border-green-200 rounded-xl">
                              <span className="text-green-600 font-bold">✓ UPI Payment Confirmed</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {form.paymentMethod === 'cash' && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-5 text-sm text-amber-800">
                      💵 You will pay <strong>₹{totalAmount.toLocaleString()}</strong> in cash after service completion.
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button onClick={() => setStep(2)} className="btn-secondary flex-1 py-3">← Back</button>
                    <button onClick={handleSubmit}
                      disabled={submitting || (form.paymentMethod === 'upi' && !upiPaid)}
                      className="btn-primary flex-1 py-3 text-base font-bold disabled:opacity-50">
                      {submitting ? 'Confirming...' : '🎉 Confirm Booking'}
                    </button>
                  </div>
                  {form.paymentMethod === 'upi' && !upiPaid && (
                    <p className="text-center text-xs text-slate-400 mt-2">Scan QR, pay, then mark as paid to confirm</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ─── Sidebar ─── */}
          <div>
            <div className="sticky top-24 space-y-4">
              {/* Service info */}
              <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
                <img src={service.images?.[0] || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400'}
                  className="w-full h-32 object-cover"
                  onError={e => { e.target.src = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=300'; }} />
                <div className="p-4">
                  <p className="text-xs font-semibold text-orange-500 mb-1">{service.category?.emoji} {service.category?.name}</p>
                  <h3 className="font-extrabold text-slate-900 mb-1">{service.name}</h3>
                  <p className="text-xs text-slate-400">{service.shortDescription}</p>
                </div>
              </div>

              {/* Selected provider */}
              {selectedProvider && (
                <div className="bg-orange-50 rounded-2xl p-4 border border-orange-100 flex items-center gap-3">
                  <ProviderAvatar provider={selectedProvider} size="md" />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{selectedProvider.name}</p>
                    <p className="text-xs text-orange-600">📍 {selectedProvider.city} · ★ {selectedProvider.rating?.toFixed(1)}</p>
                  </div>
                </div>
              )}

              {/* Progress tracker */}
              <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Your Progress</p>
                {STEPS.map((s, i) => (
                  <div key={i} className={`flex items-center gap-2.5 py-1.5 text-sm transition-all
                    ${i === step ? 'font-bold text-orange-500' : i < step ? 'text-green-600' : 'text-slate-300'}`}>
                    <span className="text-base">{i < step ? '✓' : i === step ? '→' : s.icon}</span>
                    <span>{s.label}</span>
                  </div>
                ))}
              </div>

              {/* Price summary */}
              <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Price Summary</p>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between text-slate-500"><span>{service.name}</span><span>₹{mainPrice.toLocaleString()}</span></div>
                  {bundleServices.length > 0 && <>
                    <div className="flex justify-between text-slate-500"><span>Extra services</span><span>₹{(bundleTotal - mainPrice).toLocaleString()}</span></div>
                    <div className="flex justify-between text-green-600 font-semibold"><span>Discount</span><span>−₹{discAmount.toLocaleString()}</span></div>
                  </>}
                  <div className="flex justify-between font-extrabold text-base pt-2 border-t border-slate-100">
                    <span className="text-slate-800">Total</span>
                    <span className="text-orange-500">₹{totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
