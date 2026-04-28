// Gender-neutral geometric avatar — no photos, no faces, just colored initial shapes

const COLORS = [
  ['#6366f1','#4f46e5'], // indigo
  ['#f97316','#ea580c'], // orange  
  ['#10b981','#059669'], // green
  ['#3b82f6','#2563eb'], // blue
  ['#8b5cf6','#7c3aed'], // violet
  ['#ec4899','#db2777'], // pink
  ['#14b8a6','#0d9488'], // teal
  ['#f59e0b','#d97706'], // amber
];

export const getAvatarColors = (name = '') => {
  const idx = (name.charCodeAt(0) || 0) % COLORS.length;
  return COLORS[idx];
};

export const getInitials = (name = '') =>
  name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

// Returns inline styles for a div-based avatar
export const avatarStyle = (name = '') => {
  const [from, to] = getAvatarColors(name);
  return { background: `linear-gradient(135deg, ${from}, ${to})` };
};

// Check if an avatar URL is valid (not pravatar/random)
export const isValidAvatar = (url = '') =>
  url && url.startsWith('data:') && !url.includes('pravatar');
