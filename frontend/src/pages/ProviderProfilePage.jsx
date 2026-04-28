import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { providersAPI } from '../utils/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StarRating from '../components/common/StarRating';
import TrustScore from '../components/common/TrustScore';
import ProviderAvatar from '../components/common/ProviderAvatar';

const statusDot = { online: 'bg-green-500', busy: 'bg-amber-500', offline: 'bg-ink-400' };
const statusText = { online: '🟢 Online — Available now', busy: '🟡 Busy — Limited availability', offline: '⚫ Offline' };

export default function ProviderProfilePage() {
  const { id } = useParams();
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    providersAPI.getOne(id).then(r => setProvider(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner fullPage text="Loading provider..."/>;
  if (!provider) return <div className="text-center py-20"><h2 className="text-xl font-bold">Provider not found</h2></div>;

  const jobSuccessRate = provider.totalJobs > 0 ? Math.round((provider.completedJobs / provider.totalJobs) * 100) : 0;

  return (
    <div className="page-container py-8 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="card-flat p-6 sticky top-24">
            <div className="text-center mb-5">
              <div className="relative inline-block mb-3">
                <ProviderAvatar provider={provider} size="2xl" className="mx-auto ring-4 ring-ink-100" />
                <div className={`absolute -bottom-1 -right-1 w-5 h-5 ${statusDot[provider.availabilityStatus]} rounded-full border-2 border-white`}/>
              </div>
              <h1 className="text-xl font-extrabold text-ink-900">{provider.name}</h1>
              <p className="text-ink-500 text-sm mt-1">{provider.experience} years exp · {provider.city}</p>
              <div className="flex items-center justify-center gap-2 mt-2 flex-wrap">
                <span className="text-xs font-semibold text-ink-600">{statusText[provider.availabilityStatus]}</span>
              </div>
              <div className="flex items-center justify-center gap-2 mt-2 flex-wrap">
                {provider.isVerified && <span className="badge badge-verified">✓ Verified</span>}
                {provider.isStudent && <span className="badge badge-student">🎓 Student</span>}
                {provider.isFeatured && <span className="badge bg-saffron-100 text-saffron-700">⭐ Featured</span>}
              </div>
            </div>

            <div className="flex items-center justify-around py-4 border-y border-ink-100 mb-4">
              <div className="text-center">
                <p className="text-xl font-extrabold text-ink-900">{provider.completedJobs}</p>
                <p className="text-xs text-ink-500">Jobs Done</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-extrabold text-ink-900">{provider.rating}</p>
                <p className="text-xs text-ink-500">Rating</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-extrabold text-ink-900">{jobSuccessRate}%</p>
                <p className="text-xs text-ink-500">Success Rate</p>
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-ink-700">Trust Score</span>
              <TrustScore score={provider.trustScore}/>
            </div>

            <div className="bg-ink-50 rounded-xl p-3 mb-4">
              <p className="text-sm font-bold text-ink-700 mb-1">📞 Contact</p>
              <p className="text-lg font-bold text-saffron-500">{provider.phone}</p>
              <p className="text-xs text-ink-500 mt-1">Call for problem consultation or urgent help</p>
            </div>

            <div className="space-y-2">
              <Link to="/services" className="btn-primary w-full py-2.5 text-sm">Book a Service</Link>
              <a href={`tel:${provider.phone}`} className="btn-secondary w-full py-2.5 text-sm">📞 Call Provider</a>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="lg:col-span-2 space-y-5">
          {/* About */}
          <div className="card-flat p-6">
            <h2 className="font-extrabold text-ink-900 text-lg mb-3">About</h2>
            <p className="text-ink-600 leading-relaxed">{provider.bio || 'No bio available.'}</p>
          </div>

          {/* Skills */}
          <div className="card-flat p-6">
            <h2 className="font-extrabold text-ink-900 text-lg mb-3">Skills & Expertise</h2>
            <div className="flex flex-wrap gap-2">
              {provider.skills?.map(s => (
                <span key={s} className="bg-saffron-50 text-saffron-700 text-sm font-semibold px-3 py-1.5 rounded-xl border border-saffron-100">{s}</span>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="card-flat p-6">
            <h2 className="font-extrabold text-ink-900 text-lg mb-4">Performance Stats</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { l: 'Total Jobs', v: provider.totalJobs, i: '📋' },
                { l: 'Completed', v: provider.completedJobs, i: '✅' },
                { l: 'Reviews', v: provider.numReviews, i: '⭐' },
                { l: 'Job Success Rate', v: `${jobSuccessRate}%`, i: '🎯' },
              ].map(({ l, v, i }) => (
                <div key={l} className="bg-ink-50 rounded-xl p-4 flex items-center gap-3">
                  <span className="text-2xl">{i}</span>
                  <div>
                    <p className="text-xl font-extrabold text-ink-900">{v}</p>
                    <p className="text-xs text-ink-500">{l}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Availability */}
          <div className="card-flat p-6">
            <h2 className="font-extrabold text-ink-900 text-lg mb-3">Availability</h2>
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-3 h-3 ${statusDot[provider.availabilityStatus]} rounded-full`}/>
              <span className="font-semibold text-ink-700 text-sm capitalize">{provider.availabilityStatus}</span>
            </div>
            <p className="text-ink-600 text-sm">🕐 Works: {provider.availableFrom} – {provider.availableTo}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {provider.availableDays?.map(d => <span key={d} className="bg-green-50 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-lg">{d}</span>)}
            </div>
          </div>

          {/* Problem Help Mode */}
          <div className="card-flat p-6 border-l-4 border-saffron-400">
            <h2 className="font-extrabold text-ink-900 text-lg mb-2">💬 Problem Help Mode</h2>
            <p className="text-ink-600 text-sm mb-4">Not sure if this provider can help? Call or chat directly before booking a service.</p>
            <div className="flex gap-3">
              <a href={`tel:${provider.phone}`} className="btn-primary py-2.5 text-sm flex-1">📞 Call: {provider.phone}</a>
              <Link to={`/services`} className="btn-secondary py-2.5 text-sm flex-1">📅 Book Service</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
