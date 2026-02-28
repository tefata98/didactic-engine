-- =============================================
-- Light PWA — Supabase Setup SQL
-- =============================================
-- Paste this entire script into:
-- Supabase Dashboard > SQL Editor > New Query > Run
-- =============================================

-- 1. Create the user_data table
CREATE TABLE IF NOT EXISTS user_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  namespace TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, namespace)
);

-- 2. Enable Row Level Security
ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS policies (users can only access their own data)
CREATE POLICY "Users can read own data" ON user_data
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own data" ON user_data
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own data" ON user_data
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own data" ON user_data
  FOR DELETE USING (auth.uid() = user_id);

-- 4. Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_data_user_ns ON user_data(user_id, namespace);

-- =============================================
-- DONE! Now go to:
-- Supabase Dashboard > Authentication > Providers > Email
-- and DISABLE "Confirm email" so login works immediately.
--
-- Then log in with:
--   Username: tefata
--   Password: thedark
-- The account will be created automatically on first login.
-- =============================================
