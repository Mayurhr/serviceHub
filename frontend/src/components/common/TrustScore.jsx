export default function TrustScore({ score = 0, showLabel = true }) {
  const color = score >= 85 ? '#16a34a' : score >= 70 ? '#d97706' : '#dc2626';
  const label = score >= 85 ? 'Excellent' : score >= 70 ? 'Good' : 'Fair';
  return (
    <div className="flex items-center gap-2">
      <div className="relative w-10 h-10">
        <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
          <circle cx="18" cy="18" r="15" fill="none" stroke="#e2e8f0" strokeWidth="3"/>
          <circle cx="18" cy="18" r="15" fill="none" stroke={color} strokeWidth="3"
            strokeDasharray={`${(score/100)*94.2} 94.2`} strokeLinecap="round"/>
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold" style={{color}}>{score}</span>
      </div>
      {showLabel && <div><p className="text-xs font-bold" style={{color}}>Trust: {label}</p></div>}
    </div>
  );
}
