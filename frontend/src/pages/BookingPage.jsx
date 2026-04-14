import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { servicesAPI, providersAPI, bookingsAPI, ALLOWED_CITIES } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import TrustScore from '../components/common/TrustScore';
import toast from 'react-hot-toast';

const STEPS = ['Choose Mode', 'Select Provider', 'Date & Time', 'Your Details', 'Confirm'];

export default function BookingPage() {
  const { slug } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState(''); // 'book' or 'consult'
  const [providers, setProviders] = useState([]);
  const [matchLoading, setMatchLoading] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [aiUsed, setAiUsed] = useState(false);
  const [bundleServices, setBundleServices] = useState([]);
  const [allServices, setAllServices] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    bookingDate: '',
    timeSlot: '',
    city: user?.city || 'Davanagere',
    address: user?.address || '',
    phone: user?.phone || '',
    notes: '',
    paymentMethod: 'cash',
    consultationNote: '',
  });

  useEffect(() => {
    Promise.all([
      servicesAPI.getOne(slug),
      servicesAPI.getAll({ limit: 20 }),
    ]).then(([s, all]) => {
      setService(s.data);
      setAllServices((all.data.services || []).filter(x => x.slug !== slug));
    }).catch(() => {}).finally(() => setLoading(false));
  }, [slug]);

  const runAiMatch = async (city) => {
    setMatchLoading(true);
    try {
      const res = await providersAPI.smartMatch({
        serviceId: service._id,
        budget: service.priceRange?.min,
        urgency: 'normal',
        userCity: city || form.city,
      });
      setProviders(res.data.providers || []);
      setAiUsed(true);
      toast.success('🤖 AI Smart Match complete!');
    } catch {
      toast.error('Match failed, loading all providers');
      const r = await providersAPI.getAll({ city: city || form.city, limit: 10 });
      setProviders(r.data || []);
    } finally {
      setMatchLoading(false);
    }
  };

  const loadAllProviders = async (city) => {
    setMatchLoading(true);
    try {
      const r = await providersAPI.getAll({ serviceId: service._id, city: city || form.city, limit: 15 });
      setProviders(r.data || []);
      setAiUsed(false);
    } catch {} finally {
      setMatchLoading(false);
    }
  };

  // Calculate totals correctly
  const mainServicePrice = service?.priceRange?.min || 0;
  const bundleTotal = bundleServices.reduce((sum, bid) => {
    const s = allServices.find(x => x._id === bid);
    return sum + (s?.priceRange?.min || 0);
  }, mainServicePrice);
  const discountRate = bundleServices.length >= 2 ? 0.15 : bundleServices.length === 1 ? 0.10 : 0;
  const discountAmount = bundleServices.length > 0 ? Math.round(bundleTotal * discountRate) : 0;
  const totalAmount = bundleTotal - discountAmount;

  const handleSubmit = async () => {
    if (!form.address.trim()) return toast.error('Please enter your service address');
    if (!form.phone.trim()) return toast.error('Please enter your phone number');
    setSubmitting(true);
    try {
      await bookingsAPI.create({
        serviceId: service._id,
        providerId: selectedProvider?._id || null,
        bundleServices,
        isBundleBooking: bundleServices.length > 0,
        bookingDate: form.bookingDate,
        timeSlot: form.timeSlot,
        address: `${form.address}, ${form.city}`,
        phone: form.phone,
        notes: form.notes,
        paymentMethod: form.paymentMethod,
        isProblemConsultation: mode === 'consult',
        consultationNote: form.consultationNote,
        aiMatchUsed: aiUsed,
      });
      toast.success('🎉 Booking confirmed!');
      navigate('/my-bookings');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Booking failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage text="Loading service..." />;
  if (!service) return <div className="text-center py-20"><h2 className="text-xl font-bold">Service not found</h2></div>;

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split('T')[0];

  return (
    <div className="page-container py-8 animate-fade-in">
      <h1 className="text-2xl font-extrabold text-ink-900 mb-2">Book: {service.name}</h1>
      <p className="text-ink-500 mb-6">Complete your booking in a few simple steps</p>

      {/* Step indicator */}
      <div className="flex items-center mb-10 overflow-x-auto pb-2">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center shrink-0">
            <div className="flex flex-col items-center">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-extrabold transition-all
                ${i < step ? 'bg-green-500 text-white' : i === step ? 'bg-saffron-500 text-white shadow-md' : 'bg-ink-100 text-ink-400'}`}>
                {i < step ? '✓' : i + 1}
              </div>
              <span className={`text-[10px] mt-1 font-semibold hidden sm:block ${i === step ? 'text-saffron-500' : 'text-ink-400'}`}>{s}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-8 md:w-14 h-0.5 mx-1 ${i < step ? 'bg-green-400' : 'bg-ink-200'}`} />
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="card-flat p-6 md:p-8">

            {/* Step 0: Mode */}
            {step === 0 && (
              <div className="animate-fade-in">
                <h2 className="text-xl font-extrabold text-ink-900 mb-6">How would you like to proceed?</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <button onClick={() => setMode('book')}
                    className={`p-6 rounded-2xl border-2 text-left transition-all hover:border-saffron-400 hover:bg-saffron-50 ${mode === 'book' ? 'border-saffron-400 bg-saffron-50' : 'border-ink-200'}`}>
                    <div className="text-4xl mb-3">🚀</div>
                    <h3 className="font-bold text-ink-900 text-lg mb-2">Book Service</h3>
                    <p className="text-ink-500 text-sm">Directly book. AI matches the best provider near you.</p>
                  </button>
                  <button onClick={() => setMode('consult')}
                    className={`p-6 rounded-2xl border-2 text-left transition-all hover:border-violet-400 hover:bg-violet-50 ${mode === 'consult' ? 'border-violet-400 bg-violet-50' : 'border-ink-200'}`}>
                    <div className="text-4xl mb-3">💬</div>
                    <h3 className="font-bold text-ink-900 text-lg mb-2">Ask About Problem</h3>
                    <p className="text-ink-500 text-sm">Not sure what you need? Call or chat a provider first.</p>
                    <p className="text-violet-600 text-xs font-bold mt-2">Provider phone visible · Can convert to booking</p>
                  </button>
                </div>

                {/* City selection for matching */}
                <div className="bg-ink-50 rounded-2xl p-4 mb-5">
                  <label className="block text-sm font-bold text-ink-700 mb-2">📍 Your City (for provider matching)</label>
                  <select className="input-field" value={form.city}
                    onChange={e => setForm(p => ({ ...p, city: e.target.value }))}>
                    {ALLOWED_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <p className="text-xs text-ink-400 mt-2">Providers from your city and nearby cities will be shown first</p>
                </div>

                <button disabled={!mode}
                  onClick={() => {
                    setStep(1);
                    if (mode === 'book') runAiMatch(form.city);
                    else loadAllProviders(form.city);
                  }}
                  className="btn-primary w-full py-3 disabled:opacity-40">
                  Continue →
                </button>
              </div>
            )}

            {/* Step 1: Provider */}
            {step === 1 && (
              <div className="animate-fade-in">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                  <h2 className="text-xl font-extrabold text-ink-900">
                    {mode === 'book' ? '🤖 AI-Matched Providers' : 'Select Provider to Consult'}
                  </h2>
                  {mode === 'book' && (
                    <div className="flex gap-2">
                      <button onClick={() => runAiMatch(form.city)} className="btn-primary text-xs py-1.5 px-3">Re-run AI</button>
                      <button onClick={() => loadAllProviders(form.city)} className="btn-secondary text-xs py-1.5 px-3">All</button>
                    </div>
                  )}
                </div>

                {aiUsed && (
                  <div className="bg-violet-50 border border-violet-200 rounded-xl p-3 mb-4 text-sm text-violet-700">
                    🤖 <strong>AI Smart Match</strong> — Ranked by rating, trust score, and proximity to <strong>{form.city}</strong>
                  </div>
                )}

                {matchLoading ? (
                  <LoadingSpinner text="Finding providers near you..." />
                ) : providers.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-ink-500 mb-3">No providers found in {form.city}</p>
                    <button onClick={() => loadAllProviders('')} className="btn-secondary text-sm py-2">Show all cities</button>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                    {providers.map(p => (
                      <div key={p._id}
                        onClick={() => setSelectedProvider(selectedProvider?._id === p._id ? null : p)}
                        className={`rounded-2xl border-2 cursor-pointer transition-all ${selectedProvider?._id === p._id ? 'border-saffron-400 bg-saffron-50' : 'border-ink-100 hover:border-saffron-200'}`}>
                        <div className="p-4">
                          <div className="flex items-center gap-3">
                            <img src={p.avatar || `https://i.pravatar.cc/60?u=${p._id}`}
                              className="w-12 h-12 rounded-xl object-cover shrink-0"
                              onError={e => { e.target.src = `https://i.pravatar.cc/60?u=${p._id}`; }} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <h3 className="font-bold text-ink-900 truncate">{p.name}</h3>
                                <TrustScore score={p.trustScore} showLabel={false} />
                              </div>
                              <p className="text-ink-500 text-xs">{p.experience} yrs · 📍 {p.city}</p>
                              <p className="text-saffron-500 font-bold text-sm">📞 {p.phone}</p>
                            </div>
                          </div>
                          {p.matchScore && (
                            <div className="mt-2 bg-white rounded-lg px-3 py-1.5 flex items-center justify-between border border-saffron-100">
                              <span className="text-xs font-semibold text-ink-600">🤖 AI Match Score</span>
                              <span className="font-bold text-saffron-500 text-sm">{p.matchScore}%</span>
                            </div>
                          )}
                          {mode === 'consult' && (
                            <div className="mt-2">
                              <a href={`tel:${p.phone}`} onClick={e => e.stopPropagation()}
                                className="btn-primary text-xs py-1.5 w-full block text-center">
                                📞 Call {p.name.split(' ')[0]}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {mode === 'consult' && (
                  <div className="mt-4">
                    <label className="block text-sm font-bold text-ink-700 mb-2">Describe your problem (optional)</label>
                    <textarea rows={3} className="input-field resize-none text-sm"
                      placeholder="e.g. My AC is making strange noise and not cooling properly..."
                      value={form.consultationNote}
                      onChange={e => setForm(p => ({ ...p, consultationNote: e.target.value }))} />
                  </div>
                )}

                <div className="flex gap-3 mt-6">
                  <button onClick={() => setStep(0)} className="btn-secondary flex-1 py-3">← Back</button>
                  <button onClick={() => setStep(2)} className="btn-primary flex-1 py-3">
                    {selectedProvider ? `Continue with ${selectedProvider.name.split(' ')[0]} →` : 'Continue →'}
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Date & Time + Bundle */}
            {step === 2 && (
              <div className="animate-fade-in">
                <h2 className="text-xl font-extrabold text-ink-900 mb-6">Select Date & Time</h2>

                <div className="mb-5">
                  <label className="block text-sm font-bold text-ink-700 mb-2">Preferred Date *</label>
                  <input type="date" className="input-field" min={minDateStr}
                    value={form.bookingDate}
                    onChange={e => setForm(p => ({ ...p, bookingDate: e.target.value, timeSlot: '' }))} required />
                </div>

                {form.bookingDate && (
                  <div className="mb-6 animate-slide-up">
                    <label className="block text-sm font-bold text-ink-700 mb-3">Select Time Slot *</label>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {service.timeSlots?.filter(s => s.available).map((slot, i) => (
                        <button key={i} type="button" onClick={() => setForm(p => ({ ...p, timeSlot: slot.time }))}
                          className={`py-2.5 px-2 rounded-xl text-sm font-bold border-2 transition-all
                            ${form.timeSlot === slot.time
                              ? 'border-saffron-400 bg-saffron-500 text-white'
                              : 'border-ink-200 text-ink-700 hover:border-saffron-300 hover:bg-saffron-50'}`}>
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bundle Booking */}
                <div className="bg-violet-50 rounded-2xl p-4 border border-violet-100">
                  <h3 className="font-bold text-ink-900 mb-1">
                    📦 Bundle Booking
                    <span className="text-xs font-normal text-violet-600 ml-2">
                      {bundleServices.length === 1 ? 'Save 10%' : bundleServices.length >= 2 ? 'Save 15%' : '(Add services to save)'}
                    </span>
                  </h3>
                  <p className="text-xs text-ink-500 mb-3">Add extra services and get automatic discounts applied</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                    {allServices.slice(0, 8).map(s => (
                      <label key={s._id}
                        className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer transition-all text-xs
                          ${bundleServices.includes(s._id) ? 'border-violet-400 bg-violet-100' : 'border-ink-200 hover:border-violet-300 bg-white'}`}>
                        <input type="checkbox" className="accent-violet-500 shrink-0"
                          checked={bundleServices.includes(s._id)}
                          onChange={e => setBundleServices(prev =>
                            e.target.checked ? [...prev, s._id] : prev.filter(id => id !== s._id)
                          )} />
                        <span className="font-medium text-ink-700 line-clamp-1 flex-1">{s.name}</span>
                        <span className="text-violet-600 font-bold shrink-0">₹{s.priceRange?.min}</span>
                      </label>
                    ))}
                  </div>
                  {bundleServices.length > 0 && (
                    <div className="mt-3 bg-white rounded-xl p-3 text-sm space-y-1">
                      <div className="flex justify-between text-ink-600">
                        <span>Subtotal ({bundleServices.length + 1} services)</span>
                        <span>₹{bundleTotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-green-600 font-semibold">
                        <span>Bundle Discount ({bundleServices.length >= 2 ? '15' : '10'}%)</span>
                        <span>-₹{discountAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-extrabold text-ink-900 border-t border-ink-100 pt-1">
                        <span>Total</span>
                        <span className="text-saffron-500">₹{totalAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 mt-6">
                  <button onClick={() => setStep(1)} className="btn-secondary flex-1 py-3">← Back</button>
                  <button onClick={() => {
                    if (!form.bookingDate) return toast.error('Select a date');
                    if (!form.timeSlot) return toast.error('Select a time slot');
                    setStep(3);
                  }} className="btn-primary flex-1 py-3">Continue →</button>
                </div>
              </div>
            )}

            {/* Step 3: Details */}
            {step === 3 && (
              <div className="animate-fade-in">
                <h2 className="text-xl font-extrabold text-ink-900 mb-6">Your Details</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-ink-700 mb-2">City *</label>
                    <select className="input-field" value={form.city}
                      onChange={e => setForm(p => ({ ...p, city: e.target.value }))}>
                      {ALLOWED_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-ink-700 mb-2">Service Address *</label>
                    <textarea rows={2} className="input-field resize-none"
                      placeholder="Street, area, landmark (city will be appended automatically)"
                      value={form.address}
                      onChange={e => setForm(p => ({ ...p, address: e.target.value }))} required />
                    <p className="text-xs text-ink-400 mt-1">Full address: {form.address}{form.address ? ', ' : ''}{form.city}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-ink-700 mb-2">Phone Number *</label>
                    <input type="tel" className="input-field" placeholder="Your contact number"
                      value={form.phone}
                      onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} required />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-ink-700 mb-2">Payment Method</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[['cash', '💵 Cash'], ['upi', '📱 UPI'], ['card', '💳 Card'], ['wallet', '👛 Wallet']].map(([v, l]) => (
                        <button key={v} type="button" onClick={() => setForm(p => ({ ...p, paymentMethod: v }))}
                          className={`py-2.5 rounded-xl text-sm font-semibold border-2 transition-all
                            ${form.paymentMethod === v ? 'border-saffron-400 bg-saffron-50 text-saffron-700' : 'border-ink-200 text-ink-600 hover:border-saffron-200'}`}>
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-ink-700 mb-2">Special Notes (Optional)</label>
                    <textarea rows={2} className="input-field resize-none"
                      placeholder="Any specific requirements or instructions..."
                      value={form.notes}
                      onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={() => setStep(2)} className="btn-secondary flex-1 py-3">← Back</button>
                  <button onClick={() => {
                    if (!form.address.trim()) return toast.error('Enter service address');
                    if (!form.phone.trim()) return toast.error('Enter phone number');
                    setStep(4);
                  }} className="btn-primary flex-1 py-3">Continue →</button>
                </div>
              </div>
            )}

            {/* Step 4: Confirm */}
            {step === 4 && (
              <div className="animate-fade-in">
                <h2 className="text-xl font-extrabold text-ink-900 mb-5">Confirm Booking</h2>
                <div className="bg-ink-50 rounded-2xl p-5 space-y-2.5 mb-5">
                  {[
                    ['Service', service.name],
                    ['Mode', mode === 'consult' ? '💬 Consultation + Booking' : '🚀 Direct Booking'],
                    ['Provider', selectedProvider ? `${selectedProvider.name} (${selectedProvider.city})` : 'Will be assigned'],
                    ['Date', form.bookingDate ? new Date(form.bookingDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '—'],
                    ['Time Slot', form.timeSlot],
                    ['City', form.city],
                    ['Address', form.address],
                    ['Phone', form.phone],
                    ['Payment', form.paymentMethod.toUpperCase()],
                  ].map(([l, v]) => (
                    <div key={l} className="flex justify-between gap-4">
                      <span className="text-ink-500 text-sm shrink-0">{l}</span>
                      <span className="text-ink-900 text-sm font-semibold text-right">{v}</span>
                    </div>
                  ))}
                  <div className="border-t border-ink-200 pt-3 space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-ink-600">Services total</span>
                      <span className="text-ink-900 font-semibold">₹{bundleTotal.toLocaleString()}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-green-600 font-semibold">Bundle discount ({bundleServices.length >= 2 ? '15' : '10'}%)</span>
                        <span className="text-green-600 font-semibold">-₹{discountAmount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-extrabold text-base pt-1 border-t border-ink-200">
                      <span className="text-ink-900">Total Payable</span>
                      <span className="text-saffron-500">₹{totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-5 text-sm text-amber-800">
                  ℹ️ Final charge may vary based on actual work. Pay only after service completion.
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep(3)} className="btn-secondary flex-1 py-3">← Back</button>
                  <button onClick={handleSubmit} disabled={submitting}
                    className="btn-primary flex-1 py-3 font-bold disabled:opacity-60">
                    {submitting ? 'Confirming...' : '🎉 Confirm Booking'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Summary sidebar */}
        <div>
          <div className="card-flat p-5 sticky top-24">
            <img src={service.images?.[0] || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400'}
              className="w-full h-36 object-cover rounded-xl mb-4"
              onError={e => { e.target.src = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=300'; }} />
            <h3 className="font-bold text-ink-900 mb-1">{service.name}</h3>
            <p className="text-ink-500 text-xs mb-3">{service.category?.emoji} {service.category?.name}</p>

            {selectedProvider && (
              <div className="bg-saffron-50 rounded-xl p-3 mb-3 flex items-center gap-3">
                <img src={selectedProvider.avatar || `https://i.pravatar.cc/40?u=${selectedProvider._id}`}
                  className="w-10 h-10 rounded-xl object-cover shrink-0"
                  onError={e => { e.target.src = `https://i.pravatar.cc/40?u=${selectedProvider._id}`; }} />
                <div>
                  <p className="text-xs font-bold text-ink-900">{selectedProvider.name}</p>
                  <p className="text-xs text-saffron-600">📍 {selectedProvider.city} · Trust: {selectedProvider.trustScore}</p>
                </div>
              </div>
            )}

            <div className="border-t border-ink-100 pt-3 space-y-1">
              <div className="flex justify-between text-xs text-ink-500">
                <span>Base price</span>
                <span>₹{mainServicePrice.toLocaleString()}</span>
              </div>
              {bundleServices.length > 0 && (
                <>
                  <div className="flex justify-between text-xs text-ink-500">
                    <span>Extra services</span>
                    <span>₹{(bundleTotal - mainServicePrice).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs text-green-600 font-semibold">
                    <span>Discount ({bundleServices.length >= 2 ? '15' : '10'}%)</span>
                    <span>-₹{discountAmount.toLocaleString()}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between font-extrabold text-saffron-500 pt-1 border-t border-ink-100">
                <span className="text-ink-700">Total</span>
                <span className="text-lg">₹{totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
