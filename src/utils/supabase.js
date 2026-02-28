import { createClient } from '@supabase/supabase-js';

let supabaseInstance = null;

export function getSupabase(url, anonKey) {
  if (!url || !anonKey) return null;
  if (supabaseInstance?._url === url) return supabaseInstance;

  supabaseInstance = createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storageKey: 'light-auth',
    },
  });
  supabaseInstance._url = url;
  return supabaseInstance;
}

export function getActiveSupabase() {
  return supabaseInstance;
}

/*
 SQL to run in Supabase SQL Editor:

 -- Create user_data table
 CREATE TABLE IF NOT EXISTS user_data (
   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
   user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
   namespace TEXT NOT NULL,
   data JSONB NOT NULL DEFAULT '{}',
   updated_at TIMESTAMPTZ DEFAULT now(),
   UNIQUE(user_id, namespace)
 );

 -- Enable Row Level Security
 ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;

 -- Users can only access their own data
 CREATE POLICY "Users can read own data" ON user_data
   FOR SELECT USING (auth.uid() = user_id);

 CREATE POLICY "Users can insert own data" ON user_data
   FOR INSERT WITH CHECK (auth.uid() = user_id);

 CREATE POLICY "Users can update own data" ON user_data
   FOR UPDATE USING (auth.uid() = user_id);

 CREATE POLICY "Users can delete own data" ON user_data
   FOR DELETE USING (auth.uid() = user_id);

 -- Index for faster lookups
 CREATE INDEX idx_user_data_user_ns ON user_data(user_id, namespace);

 -- Create the user in Supabase Auth (do this in the Dashboard > Authentication > Users)
 -- Email: tefata@light.app
 -- Password: thedark
*/
