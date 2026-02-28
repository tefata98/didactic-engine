export default function PageHeader({ title, subtitle, rightElement, className = '' }) {
  return (
    <div className={`flex items-start justify-between mb-6 ${className}`}>
      <div>
        <h1 className="text-2xl font-heading font-bold text-white">{title}</h1>
        {subtitle && <p className="text-white/50 text-sm mt-1">{subtitle}</p>}
      </div>
      {rightElement && <div className="flex-shrink-0">{rightElement}</div>}
    </div>
  );
}
