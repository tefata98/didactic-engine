import { useState } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { getDefaultSupabase } from '../utils/supabase';
import { useApp } from '../context/AppContext';
import SyncService from '../utils/syncService';

export default function LoginPage() {
  const { dispatch } = useApp();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please enter username and password');
      return;
    }

    setLoading(true);
    setError(null);
    setStatus('Connecting...');

    try {
      const supabase = getDefaultSupabase();
      if (!supabase) throw new Error('Failed to initialize Supabase');

      const email = `${username.trim()}@lightapp.io`;

      // Try sign in first
      setStatus('Signing in...');
      let { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: password.trim(),
      });

      // If user doesn't exist, try to sign up
      if (signInError && signInError.message.includes('Invalid login credentials')) {
        setStatus('Creating account...');
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password: password.trim(),
          options: {
            data: { username: username.trim(), display_name: 'Stefan' },
          },
        });

        if (signUpError) throw signUpError;

        // If email confirmation is disabled, user is immediately active
        if (signUpData.user && !signUpData.user.email_confirmed_at && signUpData.user.identities?.length === 0) {
          throw new Error('Email confirmation required. Check your email or disable email confirmation in Supabase Dashboard > Authentication > Providers > Email.');
        }

        data = signUpData;

        // If signup succeeded but needs confirmation, try signing in
        if (!data.session) {
          const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({
            email,
            password: password.trim(),
          });
          if (retryError) throw retryError;
          data = retryData;
        }
      } else if (signInError) {
        throw signInError;
      }

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
      setStatus('Syncing data...');
      try {
        await SyncService.pullAll();
        dispatch({ type: 'HYDRATE' });
      } catch (syncErr) {
        // Sync failure is not fatal — table might not exist yet
        console.warn('Initial sync failed:', syncErr.message);
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
      setStatus('');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative" style={{ background: '#0f172a' }}>
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
          <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 mb-4">
            <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
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
              <><Loader2 size={18} className="animate-spin" /> {status || 'Signing in...'}</>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <p className="text-[10px] text-white/20 text-center mt-4">
          New accounts are created automatically on first login
        </p>
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
