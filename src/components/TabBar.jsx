export default function TabBar({ tabs, activeTab, onChange, className = '' }) {
  return (
    <div className={`flex gap-1 overflow-x-auto no-scrollbar mb-6 ${className}`}>
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
            activeTab === tab.id
              ? 'bg-gradient-to-r from-indigo-500/20 to-violet-500/20 text-white border border-indigo-500/30'
              : 'text-white/50 hover:text-white/70 hover:bg-white/5'
          }`}
        >
          {tab.icon && <tab.icon size={16} />}
          {tab.label}
        </button>
      ))}
    </div>
  );
}
