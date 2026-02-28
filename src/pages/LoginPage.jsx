import { useState } from 'react';
import { Loader2, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { getSupabase } from '../utils/supabase';
import { useApp } from '../context/AppContext';
import SyncService from '../utils/syncService';

export default function LoginPage() {
  const { state, dispatch } = useApp();
  const { settings } = state;

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [supabaseUrl, setSupabaseUrl] = useState(settings.supabaseUrl || '');
  const [supabaseKey, setSupabaseKey] = useState(settings.supabaseAnonKey || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showConfig, setShowConfig] = useState(!settings.supabaseUrl);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please enter username and password');
      return;
    }
    if (!supabaseUrl.trim() || !supabaseKey.trim()) {
      setError('Please configure Supabase first');
      setShowConfig(true);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Save Supabase config
      dispatch({
        type: 'UPDATE_SETTINGS',
        payload: { supabaseUrl: supabaseUrl.trim(), supabaseAnonKey: supabaseKey.trim() },
      });

      // Initialize Supabase
      const supabase = getSupabase(supabaseUrl.trim(), supabaseKey.trim());
      if (!supabase) throw new Error('Failed to initialize Supabase');

      // Map username to email
      const email = `${username.trim()}@light.app`;

      // Sign in
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password: password.trim(),
      });

      if (authError) throw authError;

      // Save auth state
      dispatch({
        type: 'SET_AUTH',
        payload: {
          isAuthenticated: true,
          userId: data.user.id,
          email: data.user.email,
          username: username.trim(),
        },
      });

      // Pull remote data and merge
      try {
        await SyncService.pullAll();
        dispatch({ type: 'HYDRATE' });
      } catch (syncErr) {
        console.warn('Initial sync failed:', syncErr.message);
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative">
      {/* Background orbs */}
      <div
        className="floating-orb"
        style={{
          width: 300, height: 300,
          background: 'radial-gradient(circle, rgba(99,102,241,0.15), transparent 70%)',
          top: '5%', left: '-10%',
        }}
      />
      <div
        className="floating-orb"
        style={{
          width: 250, height: 250,
          background: 'radial-gradient(circle, rgba(139,92,246,0.12), transparent 70%)',
          bottom: '10%', right: '-5%',
          animationDelay: '2s',
        }}
      />

      {/* Logo */}
      <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mb-6 shadow-2xl">
        <span className="text-3xl font-heading font-bold text-white">L</span>
      </div>

      <h1 className="text-3xl font-heading font-bold text-white mb-1">Light</h1>
      <p className="text-sm text-white/50 mb-8">Your personal life dashboard</p>

      {/* Login Card */}
      <div className="glass-card w-full max-w-sm p-6">
        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 mb-4">
            <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
            <p className="text-xs text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs text-white/40 mb-1.5 block">Username</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="tefata"
              className="glass-input"
              autoFocus
              autoComplete="username"
            />
          </div>

          <div>
            <label className="text-xs text-white/40 mb-1.5 block">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter password"
              className="glass-input"
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-heading font-semibold text-white flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              boxShadow: '0 4px 20px rgba(99,102,241,0.3)',
            }}
          >
            {loading ? (
              <><Loader2 size={18} className="animate-spin" /> Signing in...</>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Supabase Config */}
        <div className="mt-5 pt-5 border-t border-white/5">
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="text-xs text-white/30 hover:text-white/50 transition-colors flex items-center gap-1.5"
          >
            <Wifi size={12} />
            {showConfig ? 'Hide' : 'Configure'} Supabase
          </button>

          {showConfig && (
            <div className="mt-3 space-y-3">
              <div>
                <label className="text-[10px] text-white/30 mb-1 block">Supabase URL</label>
                <input
                  type="url"
                  value={supabaseUrl}
                  onChange={e => setSupabaseUrl(e.target.value)}
                  placeholder="https://xxx.supabase.co"
                  className="glass-input text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] text-white/30 mb-1 block">Anon Key</label>
                <input
                  type="password"
                  value={supabaseKey}
                  onChange={e => setSupabaseKey(e.target.value)}
                  placeholder="eyJhbGciOiJ..."
                  className="glass-input text-xs"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Skip Login */}
      <button
        onClick={() => dispatch({ type: 'SET_AUTH', payload: { isAuthenticated: true, userId: null, email: null, username: 'guest' } })}
        className="mt-6 text-xs text-white/30 hover:text-white/50 transition-colors"
      >
        Continue without login
      </button>

      <p className="text-[10px] text-white/20 mt-8">Light v3.0.0</p>
    </div>
  );
}
