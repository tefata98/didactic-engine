import { Fingerprint, Loader2 } from 'lucide-react';

export default function LockScreen({ onUnlock, isAuthenticating, onSkip }) {
  return (
    <div className="lock-screen fixed inset-0 z-[100] flex flex-col items-center justify-center px-8">
      {/* Decorative orbs */}
      <div
        className="floating-orb"
        style={{
          width: 250, height: 250,
          background: 'radial-gradient(circle, rgba(99,102,241,0.2), transparent 70%)',
          top: '10%', left: '10%',
        }}
      />
      <div
        className="floating-orb"
        style={{
          width: 200, height: 200,
          background: 'radial-gradient(circle, rgba(139,92,246,0.15), transparent 70%)',
          bottom: '15%', right: '5%',
          animationDelay: '2s',
        }}
      />

      {/* App icon */}
      <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mb-8 shadow-2xl">
        <span className="text-3xl font-heading font-bold text-white">L</span>
      </div>

      <h1 className="text-2xl font-heading font-bold text-white mb-2">Light</h1>
      <p className="text-sm text-white/50 mb-10">Tap to unlock with biometrics</p>

      {/* Unlock button */}
      <button
        onClick={onUnlock}
        disabled={isAuthenticating}
        className="w-20 h-20 rounded-full bg-white/10 border border-white/20 flex items-center justify-center transition-all hover:bg-white/15 active:scale-95 disabled:opacity-50 mb-6"
      >
        {isAuthenticating ? (
          <Loader2 size={32} className="text-indigo-400 animate-spin" />
        ) : (
          <Fingerprint size={36} className="text-indigo-400" />
        )}
      </button>

      <button
        onClick={onSkip}
        className="text-xs text-white/30 hover:text-white/50 transition-colors"
      >
        Skip for now
      </button>
    </div>
  );
}
