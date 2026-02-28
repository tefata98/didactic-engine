export default function Toggle({ enabled, onChange }) {
  return (
    <button
      onClick={() => onChange?.(!enabled)}
      className={`relative w-12 h-7 rounded-full transition-all duration-300 flex-shrink-0 ${
        enabled ? 'bg-gradient-to-r from-indigo-500 to-violet-500' : 'bg-white/10'
      }`}
    >
      <div
        className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-lg transition-transform duration-300 ${
          enabled ? 'translate-x-[22px]' : 'translate-x-0.5'
        }`}
      />
    </button>
  );
}
