import { useState, useEffect } from 'react';
import {
  Bell, Palette, Volume2, RefreshCw, Fingerprint, WifiOff,
  Moon, Dumbbell, Mic, DollarSign, BookOpen, Download,
  Upload, Trash2, Info, ChevronRight, Shield, Clock, AlertTriangle, Zap,
  Sun, Wifi, LogOut, Cloud, Loader2, User
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import GlassCard from '../components/GlassCard';
import Toggle from '../components/Toggle';
import PageHeader from '../components/PageHeader';
import StorageService from '../utils/storageService';
import useSounds from '../hooks/useSounds';
import SyncService from '../utils/syncService';
import { getActiveSupabase } from '../utils/supabase';

function SettingRow({ icon: Icon, label, description, children }) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
          <Icon size={18} className="text-white/60" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-white">{label}</p>
          {description && <p className="text-xs text-white/40 mt-0.5">{description}</p>}
        </div>
      </div>
      <div className="flex-shrink-0 ml-3">{children}</div>
    </div>
  );
}

function SettingSection({ title, children }) {
  return (
    <GlassCard className="mb-4">
      <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">{title}</h3>
      <div className="divide-y divide-white/5">{children}</div>
    </GlassCard>
  );
}

export default function SettingsPage() {
  const { state, dispatch } = useApp();
  const { settings, auth } = state;
  const navigate = useNavigate();
  const sounds = useSounds();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncing, setSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(settings.lastSyncTime || null);
  const [notificationPermission, setNotificationPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied'
  );

  // Track online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRequestNotificationPermission = async () => {
    if (typeof Notification === 'undefined') return;
    const result = await Notification.requestPermission();
    setNotificationPermission(result);
  };

  const updateSetting = (key, value) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: { [key]: value } });
  };

  // Dark Mode toggle — applies data-theme on <html>
  const handleDarkModeToggle = (v) => {
    updateSetting('darkMode', v);
    sounds.toggle(v);
    if (v) {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  };

  // Apply dark mode on mount based on settings
  useEffect(() => {
    if (!settings.darkMode) {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [settings.darkMode]);

  // Sound Effects toggle
  const handleSoundToggle = (v) => {
    updateSetting('soundEffects', v);
    // Play a sound to confirm (if enabling)
    if (v) {
      setTimeout(() => sounds.toggle(true), 50);
    }
  };

  // Offline Mode — communicate with SW
  const handleOfflineModeToggle = (v) => {
    updateSetting('offlineMode', v);
    sounds.toggle(v);
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(reg => {
        reg.active?.postMessage({
          type: 'SET_OFFLINE_MODE',
          payload: { enabled: v },
        });
      });
    }
  };

  // Face ID toggle
  const handleFaceIdToggle = async (v) => {
    if (v) {
      // Test if biometric is available
      if (window.PublicKeyCredential) {
        try {
          const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
          if (!available) {
            alert('Biometric authentication is not available on this device.');
            return;
          }
        } catch {
          // Proceed anyway
        }
      }
    }
    updateSetting('faceId', v);
    sounds.toggle(v);
    if (!v) {
      sessionStorage.removeItem('light_locked');
    }
  };

  const handleExport = () => {
    const data = StorageService.exportAll();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `light-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    sounds.success();
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target.result);
          StorageService.importAll(data);
          dispatch({ type: 'HYDRATE' });
          sounds.success();
        } catch {
          alert('Invalid backup file');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleClearAll = () => {
    StorageService.clearAll();
    dispatch({ type: 'HYDRATE' });
    setShowClearConfirm(false);
  };

  const handleManualSync = async () => {
    setSyncing(true);
    try {
      await SyncService.fullSync();
      const now = Date.now();
      setLastSyncTime(now);
      updateSetting('lastSyncTime', now);
      dispatch({ type: 'HYDRATE' });
      sounds.success();
    } catch (err) {
      alert('Sync failed: ' + err.message);
    } finally {
      setSyncing(false);
    }
  };

  const handleLogout = async () => {
    const supabase = getActiveSupabase();
    if (supabase) {
      await supabase.auth.signOut().catch(() => {});
    }
    dispatch({ type: 'LOGOUT' });
    navigate('/login');
  };

  const getLastSyncText = () => {
    if (!lastSyncTime) return 'Never synced';
    const diff = Date.now() - lastSyncTime;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="space-y-2 pb-4">
      <PageHeader title="Settings" subtitle="Customize your experience" />

      {/* Online/Offline Banner */}
      {!isOnline && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-2">
          <WifiOff size={16} className="text-amber-400" />
          <span className="text-sm text-amber-400">You're offline — data is saved locally</span>
        </div>
      )}

      {/* General */}
      <SettingSection title="General">
        <SettingRow icon={Bell} label="Push Notifications" description={
          notificationPermission === 'granted' ? 'Sent via Service Worker' :
          notificationPermission === 'denied' ? 'Blocked in browser settings' :
          'Get reminders and alerts'
        }>
          <div className="flex items-center gap-2">
            {notificationPermission === 'default' && settings.notifications && (
              <button onClick={handleRequestNotificationPermission} className="text-xs text-indigo-400">
                Allow
              </button>
            )}
            <Toggle enabled={settings.notifications} onChange={(v) => {
              updateSetting('notifications', v);
              sounds.toggle(v);
              if (v && notificationPermission === 'default') {
                handleRequestNotificationPermission();
              }
            }} />
          </div>
        </SettingRow>
        <SettingRow icon={settings.darkMode ? Moon : Sun} label="Dark Mode" description={settings.darkMode ? 'Dark theme active' : 'Light theme active'}>
          <Toggle enabled={settings.darkMode} onChange={handleDarkModeToggle} />
        </SettingRow>
        <SettingRow icon={Volume2} label="Sound Effects" description="Tap, success, and timer sounds">
          <Toggle enabled={settings.soundEffects} onChange={handleSoundToggle} />
        </SettingRow>
        <SettingRow icon={RefreshCw} label="Auto Sync" description={settings.autoSync ? 'Syncs when data changes' : 'Login required for sync'}>
          <Toggle enabled={settings.autoSync} onChange={(v) => { updateSetting('autoSync', v); sounds.toggle(v); }} />
        </SettingRow>
      </SettingSection>

      {/* Privacy */}
      <SettingSection title="Privacy & Security">
        <SettingRow icon={Fingerprint} label="Face ID / Fingerprint" description="Lock app when switching away">
          <Toggle enabled={settings.faceId} onChange={handleFaceIdToggle} />
        </SettingRow>
        <SettingRow icon={settings.offlineMode ? WifiOff : Wifi} label="Offline Mode" description={settings.offlineMode ? 'Cache-first, works offline' : 'Network-first, always fresh'}>
          <Toggle enabled={settings.offlineMode} onChange={handleOfflineModeToggle} />
        </SettingRow>
      </SettingSection>

      {/* Reminders */}
      <SettingSection title="Reminders">
        <SettingRow icon={Moon} label="Sleep Wind-Down" description={`Daily at ${settings.reminders.sleepWindDown.time || '10:30 PM'}`}>
          <Toggle
            enabled={settings.reminders.sleepWindDown.enabled}
            onChange={(v) => { dispatch({ type: 'UPDATE_REMINDER', payload: { sleepWindDown: { ...settings.reminders.sleepWindDown, enabled: v } } }); sounds.toggle(v); }}
          />
        </SettingRow>
        <SettingRow icon={Dumbbell} label="Workout" description={`Mon/Wed/Fri at ${settings.reminders.workout.time || '7:00 AM'}`}>
          <Toggle
            enabled={settings.reminders.workout.enabled}
            onChange={(v) => { dispatch({ type: 'UPDATE_REMINDER', payload: { workout: { ...settings.reminders.workout, enabled: v } } }); sounds.toggle(v); }}
          />
        </SettingRow>
        <SettingRow icon={Mic} label="Vocal Practice" description={`Daily at ${settings.reminders.vocalPractice.time || '6:00 PM'}`}>
          <Toggle
            enabled={settings.reminders.vocalPractice.enabled}
            onChange={(v) => { dispatch({ type: 'UPDATE_REMINDER', payload: { vocalPractice: { ...settings.reminders.vocalPractice, enabled: v } } }); sounds.toggle(v); }}
          />
        </SettingRow>
        <SettingRow icon={DollarSign} label="Budget Alerts" description="Spending notifications">
          <Toggle
            enabled={settings.reminders.budgetAlerts.enabled}
            onChange={(v) => { dispatch({ type: 'UPDATE_REMINDER', payload: { budgetAlerts: { ...settings.reminders.budgetAlerts, enabled: v } } }); sounds.toggle(v); }}
          />
        </SettingRow>
        <SettingRow icon={BookOpen} label="Reading Goal" description={`Daily at ${settings.reminders.readingGoal.time || '9:00 PM'}`}>
          <Toggle
            enabled={settings.reminders.readingGoal.enabled}
            onChange={(v) => { dispatch({ type: 'UPDATE_REMINDER', payload: { readingGoal: { ...settings.reminders.readingGoal, enabled: v } } }); sounds.toggle(v); }}
          />
        </SettingRow>
      </SettingSection>

      {/* AI Integration */}
      <SettingSection title="AI Integration">
        <SettingRow icon={Zap} label="Anthropic API Key" description={settings.anthropicApiKey ? 'Key is set' : 'Required for AI news'}>
          <div className="flex items-center gap-2">
            <input
              type="password"
              value={settings.anthropicApiKey || ''}
              onChange={(e) => updateSetting('anthropicApiKey', e.target.value)}
              placeholder="sk-ant-..."
              className="w-36 px-2 py-1.5 rounded-lg text-xs bg-white/5 border border-white/10 outline-none focus:border-indigo-500/50"
              style={{ color: 'var(--text-primary)' }}
            />
          </div>
        </SettingRow>
      </SettingSection>

      {/* Install App */}
      <button
        className="w-full py-4 rounded-glass font-heading font-semibold text-white flex items-center justify-center gap-2 mb-4"
        style={{
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          boxShadow: '0 4px 20px rgba(99,102,241,0.3)',
        }}
        onClick={() => {
          if (window.deferredPrompt) {
            window.deferredPrompt.prompt();
          }
        }}
      >
        <Download size={20} />
        Install App
      </button>

      {/* Data Management */}
      <SettingSection title="Data Management">
        <SettingRow icon={Download} label="Export Data" description="Download JSON backup">
          <button onClick={handleExport} className="btn-ghost text-xs">Export</button>
        </SettingRow>
        <SettingRow icon={Upload} label="Import Data" description="Restore from backup">
          <button onClick={handleImport} className="btn-ghost text-xs">Import</button>
        </SettingRow>
        <SettingRow icon={Trash2} label="Clear All Data" description="Delete everything">
          {!showClearConfirm ? (
            <button onClick={() => setShowClearConfirm(true)} className="px-3 py-1.5 rounded-xl text-xs font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-colors">
              Clear
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={handleClearAll} className="px-3 py-1.5 rounded-xl text-xs font-medium text-white bg-red-500 hover:bg-red-600 transition-colors">
                Confirm
              </button>
              <button onClick={() => setShowClearConfirm(false)} className="px-3 py-1.5 rounded-xl text-xs font-medium text-white/50 bg-white/5">
                Cancel
              </button>
            </div>
          )}
        </SettingRow>
      </SettingSection>

      {/* Account & Sync */}
      <SettingSection title="Account & Sync">
        <SettingRow icon={User} label="Logged in as" description={auth.username ? `${auth.username}${auth.email ? ` (${auth.email})` : ''}` : 'Guest'}>
          {auth.userId && (
            <span className="text-[10px] text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">Connected</span>
          )}
        </SettingRow>
        {auth.userId && (
          <SettingRow icon={Cloud} label="Manual Sync" description={`Last sync: ${getLastSyncText()}`}>
            <button
              onClick={handleManualSync}
              disabled={syncing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 transition-colors disabled:opacity-50"
            >
              {syncing ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
              {syncing ? 'Syncing...' : 'Sync Now'}
            </button>
          </SettingRow>
        )}
        <SettingRow icon={LogOut} label="Log Out" description="Sign out of your account">
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-xl text-xs font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-colors"
          >
            Log Out
          </button>
        </SettingRow>
      </SettingSection>

      {/* Version */}
      <div className="text-center py-6">
        <p className="text-xs text-white/30">Light v3.0.0</p>
        <p className="text-xs text-white/20 mt-1">Made with care for Stefan</p>
      </div>
    </div>
  );
}
