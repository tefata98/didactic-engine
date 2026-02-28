export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
          <Icon size={28} className="text-white/30" />
        </div>
      )}
      <h3 className="text-lg font-heading font-semibold text-white/70 mb-2">{title}</h3>
      {description && <p className="text-sm text-white/40 max-w-xs mb-6">{description}</p>}
      {action && (
        <button onClick={action.onClick} className="btn-primary text-sm">
          {action.label}
        </button>
      )}
    </div>
  );
}
