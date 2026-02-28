import { getActiveSupabase } from './supabase';

const NAMESPACES = [
  'lifeos_planner', 'lifeos_fitness', 'lifeos_vocals',
  'lifeos_finance', 'lifeos_reading', 'lifeos_sleep',
  'lifeos_settings', 'lifeos_identity', 'lifeos_news'
];

let syncDebounce = null;

const SyncService = {
  /**
   * Pull all data from Supabase and merge with localStorage.
   * Remote data wins for conflicting keys (server is source of truth).
   */
  async pullAll() {
    const supabase = getActiveSupabase();
    if (!supabase) throw new Error('Supabase not configured');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('user_data')
      .select('namespace, data, updated_at')
      .eq('user_id', user.id);

    if (error) throw error;

    // Merge: remote data wins, but keep local keys that don't exist remotely
    const remoteMap = {};
    (data || []).forEach(row => {
      remoteMap[row.namespace] = row.data;
    });

    NAMESPACES.forEach(ns => {
      if (remoteMap[ns]) {
        // Merge: remote wins for existing keys, keep local-only keys
        const local = JSON.parse(localStorage.getItem(ns) || '{}');
        const merged = { ...local, ...remoteMap[ns] };
        localStorage.setItem(ns, JSON.stringify(merged));
      }
    });

    return { synced: Object.keys(remoteMap).length };
  },

  /**
   * Push all localStorage data to Supabase.
   */
  async pushAll() {
    const supabase = getActiveSupabase();
    if (!supabase) throw new Error('Supabase not configured');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const upserts = [];
    NAMESPACES.forEach(ns => {
      const raw = localStorage.getItem(ns);
      if (raw) {
        upserts.push({
          user_id: user.id,
          namespace: ns,
          data: JSON.parse(raw),
          updated_at: new Date().toISOString(),
        });
      }
    });

    if (upserts.length === 0) return { synced: 0 };

    const { error } = await supabase
      .from('user_data')
      .upsert(upserts, { onConflict: 'user_id,namespace' });

    if (error) throw error;
    return { synced: upserts.length };
  },

  /**
   * Debounced push — call on data change when Auto Sync is enabled.
   */
  debouncedPush(delayMs = 2000) {
    if (syncDebounce) clearTimeout(syncDebounce);
    syncDebounce = setTimeout(() => {
      this.pushAll().catch(err => {
        console.warn('Auto sync failed:', err.message);
      });
    }, delayMs);
  },

  /**
   * Full sync: pull then push.
   */
  async fullSync() {
    await this.pullAll();
    await this.pushAll();
  },
};

export default SyncService;
