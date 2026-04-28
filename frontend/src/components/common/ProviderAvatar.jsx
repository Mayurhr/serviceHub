import { getInitials, avatarStyle, isValidAvatar } from '../../utils/avatar';

/**
 * Gender-neutral provider avatar.
 * Shows data: SVG from backend if valid, otherwise renders initials div.
 * Never falls back to pravatar or any photo service.
 */
export default function ProviderAvatar({ provider, size = 'md', className = '' }) {
  const sizeMap = {
    xs:  'w-8 h-8 text-xs',
    sm:  'w-10 h-10 text-sm',
    md:  'w-12 h-12 text-sm',
    lg:  'w-16 h-16 text-lg',
    xl:  'w-20 h-20 text-xl',
    '2xl': 'w-24 h-24 text-2xl',
  };
  const sizeClass = sizeMap[size] || sizeMap.md;
  const initials = getInitials(provider?.name);
  const style = avatarStyle(provider?.name || '');
  const hasValid = isValidAvatar(provider?.avatar);

  return (
    <div className={`${sizeClass} rounded-2xl flex items-center justify-center font-extrabold text-white shrink-0 ring-2 ring-white/50 ${className}`}
      style={hasValid ? {} : style}>
      {hasValid
        ? <img src={provider.avatar} alt={provider.name} className={`${sizeClass} rounded-2xl object-cover`}
            onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
        : null}
      {hasValid
        ? <span style={{ display:'none', ...style }} className={`${sizeClass} rounded-2xl items-center justify-center font-extrabold text-white`}>{initials}</span>
        : <span>{initials}</span>
      }
    </div>
  );
}
