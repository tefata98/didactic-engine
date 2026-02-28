import { createClient } from '@supabase/supabase-js';

// Hardcoded Supabase config for Light PWA
const SUPABASE_URL = 'https://hrmhvomfjmaxtobvvzrw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhybWh2b21mam1heHRvYnZ2enJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyNTk3NTcsImV4cCI6MjA4NzgzNTc1N30.QyExHJ5Rce4u8B7KosV3JYrKMPWGYym9sC19o6sVcI8';

let supabaseInstance = null;

export function getSupabase(url, anonKey) {
  const finalUrl = url || SUPABASE_URL;
  const finalKey = anonKey || SUPABASE_ANON_KEY;
  if (!finalUrl || !finalKey) return null;
  if (supabaseInstance?._url === finalUrl) return supabaseInstance;

  supabaseInstance = createClient(finalUrl, finalKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storageKey: 'light-auth',
    },
  });
  supabaseInstance._url = finalUrl;
  return supabaseInstance;
}

export function getDefaultSupabase() {
  return getSupabase(SUPABASE_URL, SUPABASE_ANON_KEY);
}

export function getActiveSupabase() {
  return supabaseInstance;
}

export { SUPABASE_URL, SUPABASE_ANON_KEY };
