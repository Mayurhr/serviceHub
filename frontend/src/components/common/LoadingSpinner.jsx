export default function LoadingSpinner({ size = 'md', text, fullPage }) {
  const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' };
  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={`${sizes[size]} border-4 border-saffron-100 border-t-saffron-500 rounded-full animate-spin`}></div>
      {text && <p className="text-ink-500 text-sm font-medium">{text}</p>}
    </div>
  );
  if (fullPage) return <div className="flex items-center justify-center min-h-[60vh]">{spinner}</div>;
  return spinner;
}
