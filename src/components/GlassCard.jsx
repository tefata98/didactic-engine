export default function GlassCard({ children, className = '', onClick, hover = false, padding = 'p-5' }) {
  return (
    <div
      onClick={onClick}
      className={`glass-card ${padding} ${hover ? 'hover:bg-white/[0.06] cursor-pointer' : ''} ${onClick ? 'cursor-pointer' : ''} transition-all duration-300 ${className}`}
    >
      {children}
    </div>
  );
}
