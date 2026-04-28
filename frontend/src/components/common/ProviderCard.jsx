import { Link } from 'react-router-dom';
import StarRating from './StarRating';
import TrustScore from './TrustScore';
import ProviderAvatar from './ProviderAvatar';

const statusColors = { online: 'badge-online', busy: 'badge-busy', offline: 'badge-offline' };
const statusDot = { online: 'bg-green-500', busy: 'bg-amber-500', offline: 'bg-ink-400' };

export default function ProviderCard({ provider }) {
  return (
    <Link to={`/providers/${provider._id}`} className="card group block">
      <div className="p-5">
        <div className="flex items-start gap-4 mb-4">
          <div className="relative flex-shrink-0">
            <ProviderAvatar provider={provider} size="lg" className="group-hover:ring-saffron-200 transition-all" />
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${statusDot[provider.availabilityStatus]} rounded-full border-2 border-white`} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-ink-900 group-hover:text-saffron-500 transition-colors line-clamp-1">{provider.name}</h3>
            <p className="text-ink-500 text-xs mb-1">{provider.experience} yrs · 📍 {provider.city}</p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`badge ${statusColors[provider.availabilityStatus]} text-[10px]`}>
                {provider.availabilityStatus === 'online' ? '● Online' : provider.availabilityStatus === 'busy' ? '● Busy' : '○ Offline'}
              </span>
              {provider.isVerified && <span className="badge badge-verified text-[10px]">✓ Verified</span>}
              {provider.isStudent && <span className="badge badge-student text-[10px]">🎓 Student</span>}
            </div>
          </div>
          <TrustScore score={provider.trustScore} showLabel={false} />
        </div>

        <p className="text-ink-500 text-xs mb-3 line-clamp-2 leading-relaxed">{provider.bio}</p>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {provider.skills?.slice(0, 3).map(s => (
            <span key={s} className="text-[10px] bg-ink-100 text-ink-600 px-2 py-0.5 rounded-lg font-medium">{s}</span>
          ))}
          {provider.skills?.length > 3 && <span className="text-[10px] text-ink-400">+{provider.skills.length - 3}</span>}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-ink-100">
          <StarRating rating={provider.rating} showCount count={provider.numReviews} />
          <p className="text-xs text-ink-500">{provider.completedJobs} jobs done</p>
        </div>

        {provider.matchScore && (
          <div className="mt-2 bg-saffron-50 rounded-lg px-3 py-1.5 flex items-center justify-between">
            <span className="text-xs font-semibold text-saffron-700">🤖 AI Match Score</span>
            <span className="text-sm font-bold text-saffron-600">{provider.matchScore}%</span>
          </div>
        )}
      </div>
    </Link>
  );
}
