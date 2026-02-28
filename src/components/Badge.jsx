export default function Badge({ children, color = '#6366f1', variant = 'filled', size = 'sm' }) {
  const sizeClasses = size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  if (variant === 'outlined') {
    return (
      <span
        className={`inline-flex items-center rounded-full font-medium ${sizeClasses}`}
        style={{ color, border: `1px solid ${color}40` }}
      >
        {children}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${sizeClasses}`}
      style={{ background: `${color}20`, color }}
    >
      {children}
    </span>
  );
}
