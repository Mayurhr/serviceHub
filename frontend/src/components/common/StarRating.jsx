export default function StarRating({ rating = 0, size = 'sm', showCount, count }) {
  const filled = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  const sz = size === 'lg' ? 'text-2xl' : size === 'md' ? 'text-lg' : 'text-sm';
  return (
    <div className="flex items-center gap-1">
      <div className={`flex ${sz}`}>
        {[...Array(5)].map((_, i) => (
          <span key={i} className={i < filled ? 'text-amber-400' : i === filled && half ? 'text-amber-300' : 'text-ink-200'}>★</span>
        ))}
      </div>
      {showCount && <span className="text-xs text-ink-500 font-medium">({count || 0})</span>}
    </div>
  );
}
