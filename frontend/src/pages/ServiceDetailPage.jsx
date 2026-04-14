import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { servicesAPI, reviewsAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StarRating from '../components/common/StarRating';
import toast from 'react-hot-toast';

const TABS = ['overview','includes','reviews'];

export default function ServiceDetailPage() {
  const { slug } = useParams();
  const { user } = useAuth();
  const [service, setService] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');
  const [rf, setRf] = useState({ rating: 5, title: '', comment: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([servicesAPI.getOne(slug), reviewsAPI.getForService(slug)])
      .then(([s, r]) => { setService(s.data); setReviews(r.data); })
      .catch(() => {}).finally(() => setLoading(false));
  }, [slug]);

  const submitReview = async e => {
    e.preventDefault();
    if (!user) return toast.error('Login to review');
    setSubmitting(true);
    try {
      const res = await reviewsAPI.create({ serviceId: service._id, ...rf });
      setReviews(prev => [res.data, ...prev]);
      setRf({ rating: 5, title: '', comment: '' });
      toast.success('Review submitted!');
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
    finally { setSubmitting(false); }
  };

  if (loading) return <LoadingSpinner fullPage text="Loading service..."/>;
  if (!service) return <div className="text-center py-20"><h2 className="text-xl font-bold">Service not found</h2><Link to="/services" className="btn-primary mt-4 inline-block">Browse Services</Link></div>;

  const price = service.priceRange;
  const priceStr = price?.unit === 'hourly' ? `₹${price.min}/hr` : price?.unit === 'per_plate' ? `₹${price.min}/plate` : `₹${price?.min?.toLocaleString()}`;

  return (
    <div className="page-container py-8 animate-fade-in">
      <nav className="flex items-center gap-2 text-sm text-ink-500 mb-6 flex-wrap">
        <Link to="/" className="hover:text-saffron-500">Home</Link>/
        <Link to="/services" className="hover:text-saffron-500">Services</Link>/
        <Link to={`/services?category=${service.category?.slug}`} className="hover:text-saffron-500">{service.category?.name}</Link>/
        <span className="text-ink-900 font-medium">{service.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="card-flat mb-6">
            <div className="relative h-72 md:h-96">
              <img src={service.images?.[0] || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800'}
                alt={service.name} className="w-full h-full object-cover"
                onError={e => e.target.src='https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600'}/>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"/>
              <div className="absolute bottom-5 left-5 right-5">
                <span className="bg-white/20 backdrop-blur text-white text-xs font-semibold px-3 py-1 rounded-full border border-white/20">{service.category?.emoji} {service.category?.name}</span>
                <h1 className="text-2xl md:text-3xl font-extrabold text-white mt-2">{service.name}</h1>
              </div>
              {service.isFeatured && <div className="absolute top-4 left-4 bg-saffron-500 text-white text-xs font-bold px-3 py-1 rounded-xl">⭐ Featured</div>}
              {service.isPopular && <div className="absolute top-4 right-4 bg-violet-600 text-white text-xs font-bold px-3 py-1 rounded-xl">🔥 Popular</div>}
            </div>
            <div className="p-6">
              <div className="flex flex-wrap items-center gap-4 mb-5">
                <div className="flex items-center gap-2"><StarRating rating={service.rating} size="md"/><span className="font-bold text-ink-900">{service.rating}</span><span className="text-ink-500 text-sm">({service.numReviews} reviews)</span></div>
                <span className="text-ink-200">|</span>
                <span className="text-ink-600 text-sm">🕐 {service.duration} min</span>
                <span className="text-ink-200">|</span>
                <span className="text-ink-600 text-sm">📋 {service.totalBookings?.toLocaleString()} bookings</span>
              </div>

              <div className="flex gap-1 border-b border-ink-100 mb-5">
                {TABS.map(t => (
                  <button key={t} onClick={() => setTab(t)}
                    className={`px-4 py-2.5 text-sm font-semibold capitalize transition-all rounded-t-lg -mb-px ${tab===t ? 'text-saffron-500 border-b-2 border-saffron-500 bg-saffron-50' : 'text-ink-500 hover:text-ink-700'}`}>{t}</button>
                ))}
              </div>

              {tab === 'overview' && (
                <div className="animate-fade-in">
                  <p className="text-ink-600 leading-relaxed mb-4">{service.description}</p>
                  {service.priceRange?.note && <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800">ℹ️ {service.priceRange.note}</div>}
                  {service.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">{service.tags.map(t => <span key={t} className="bg-saffron-50 text-saffron-700 text-xs font-medium px-3 py-1 rounded-full">#{t}</span>)}</div>
                  )}
                </div>
              )}
              {tab === 'includes' && (
                <div className="animate-fade-in">
                  <h3 className="font-bold text-ink-900 mb-4">What's Included</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {service.includes?.map((item,i) => (
                      <div key={i} className="flex items-center gap-3 bg-green-50 rounded-xl p-3">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0 font-bold">✓</div>
                        <span className="text-ink-700 text-sm font-medium">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {tab === 'reviews' && (
                <div className="animate-fade-in space-y-4">
                  {reviews.length === 0 ? <p className="text-ink-500 text-center py-8">No reviews yet. Be the first!</p>
                   : reviews.map(r => (
                    <div key={r._id} className="border border-ink-100 rounded-2xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-saffron-100 rounded-full flex items-center justify-center text-saffron-700 font-bold text-sm">{r.user?.name?.[0]}</div>
                          <span className="font-semibold text-ink-800 text-sm">{r.user?.name}</span>
                          {r.isVerified && <span className="badge badge-verified text-[10px]">✓ Verified</span>}
                        </div>
                        <StarRating rating={r.rating}/>
                      </div>
                      {r.title && <p className="font-semibold text-ink-800 text-sm mb-1">{r.title}</p>}
                      <p className="text-ink-600 text-sm">{r.comment}</p>
                      <p className="text-ink-400 text-xs mt-2">{new Date(r.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</p>
                    </div>
                  ))}
                  {user && (
                    <div className="border-t border-ink-100 pt-5 mt-5">
                      <h4 className="font-bold text-ink-900 mb-3">Write a Review</h4>
                      <form onSubmit={submitReview} className="space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-ink-600 font-medium">Rating:</span>
                          {[1,2,3,4,5].map(n => (
                            <button key={n} type="button" onClick={() => setRf(p=>({...p,rating:n}))}
                              className={`text-xl ${n<=rf.rating?'text-amber-400':'text-ink-200'}`}>★</button>
                          ))}
                        </div>
                        <input type="text" placeholder="Review title (optional)" className="input-field text-sm py-2.5" value={rf.title} onChange={e=>setRf(p=>({...p,title:e.target.value}))}/>
                        <textarea rows={3} placeholder="Share your experience..." className="input-field text-sm py-2.5 resize-none" value={rf.comment} onChange={e=>setRf(p=>({...p,comment:e.target.value}))} required/>
                        <button type="submit" disabled={submitting} className="btn-primary text-sm py-2 disabled:opacity-60">{submitting?'Submitting...':'Submit Review'}</button>
                      </form>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Booking Widget */}
        <div>
          <div className="card-flat p-6 sticky top-24">
            <div className="text-center mb-5 pb-5 border-b border-ink-100">
              <p className="text-ink-500 text-sm mb-1">Starting from</p>
              <p className="text-3xl font-extrabold text-saffron-500">{priceStr}</p>
              {price?.note && <p className="text-ink-400 text-xs mt-1">{price.note}</p>}
              <p className="text-ink-400 text-xs mt-1">⏱ Duration: {service.duration} min</p>
            </div>
            <div className="space-y-2.5 mb-5">
              {['Verified professional','Service guarantee','Free cancellation (24hr)','AI provider matching','Live tracking included'].map(i => (
                <div key={i} className="flex items-center gap-2 text-sm text-ink-600"><span className="text-green-500 font-bold">✓</span> {i}</div>
              ))}
            </div>
            {user ? (
              <div className="space-y-3">
                <Link to={`/book/${service.slug}`} className="btn-primary w-full py-3 text-base font-bold">🚀 Book Now</Link>
                <Link to={`/providers?service=${service._id}`} className="btn-secondary w-full py-2.5 text-sm">👥 View Providers</Link>
              </div>
            ) : (
              <Link to="/login" className="btn-primary w-full py-3 text-base font-bold block text-center">Login to Book</Link>
            )}
            <p className="text-center text-xs text-ink-400 mt-3">Pay only after service completion</p>
          </div>
        </div>
      </div>
    </div>
  );
}
