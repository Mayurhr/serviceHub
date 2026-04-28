import { Link } from 'react-router-dom';
import StarRating from './StarRating';

export default function ServiceCard({ service }) {
  const price = service.priceRange;
  const priceStr = price?.unit === 'hourly' ? `₹${price.min}/hr` : price?.unit === 'per_plate' ? `₹${price.min}/plate` : `₹${price?.min?.toLocaleString()}`;

  return (
    <Link to={`/services/${service.slug}`} className="card group block">
      <div className="relative h-44 overflow-hidden">
        <img src={service.images?.[0] || `https://images.unsplash.com/photo-1521791136064-7986c2920216?w=400&auto=format`}
          alt={service.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=400&auto=format'; }}/>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"/>
        {service.isFeatured && <div className="absolute top-2 left-2 bg-saffron-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg">⭐ Featured</div>}
        {service.isPopular && <div className="absolute top-2 right-2 bg-violet-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg">🔥 Popular</div>}
        <div className="absolute bottom-2 left-2">
          <span className="bg-white/20 backdrop-blur text-white text-[10px] font-semibold px-2 py-1 rounded-lg border border-white/20">
            {service.category?.emoji} {service.category?.name}
          </span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-ink-900 text-sm mb-1 line-clamp-1 group-hover:text-saffron-500 transition-colors">{service.name}</h3>
        <p className="text-ink-500 text-xs mb-3 line-clamp-2 leading-relaxed">{service.shortDescription}</p>
        <div className="flex items-center justify-between">
          <div>
            <StarRating rating={service.rating || 0} showCount count={service.numReviews}/>
            <p className="text-[10px] text-ink-400 mt-0.5">{service.totalBookings?.toLocaleString()} bookings</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-saffron-500 text-sm">{priceStr}</p>
            <p className="text-[10px] text-ink-400">{service.duration} min</p>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-ink-100 flex items-center justify-between">
          <span className="text-xs text-ink-500">🕐 {service.duration} min</span>
          <span className="text-xs font-bold text-saffron-500 bg-saffron-50 px-2.5 py-1 rounded-lg group-hover:bg-saffron-100 transition-colors">Book Now →</span>
        </div>
      </div>
    </Link>
  );
}
