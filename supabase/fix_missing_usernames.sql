-- =================================================================================
-- FIX MISSING USERNAMES
-- Run this in your Supabase SQL Editor to:
-- 1. Backfill usernames for existing users who don't have one.
-- 2. Update the signup trigger to ensure new users get a username automatically.
-- =================================================================================

-- 1. Update existing profiles with NULL usernames
-- Uses 'user_' + first 8 characters of their UUID
UPDATE public.profiles
SET username = 'user_' || lower(substring(replace(id::text, '-', ''), 1, 8))
WHERE username IS NULL;

-- 2. Update the handle_new_user function to ensure automatic allocation for future users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  temp_username text;
BEGIN
  -- Generate a temporary username: user_ + the first 8 characters of their UUID
  temp_username := 'user_' || lower(substring(replace(new.id::text, '-', ''), 1, 8));
  
  INSERT INTO public.profiles (id, display_name, username)
  VALUES (
    new.id, 
    SPLIT_PART(new.email, '@', 1), -- Default display name from email
    temp_username                  -- Temporary username
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Ensure the trigger is correctly mapped (in case it was dropped)
-- Note: 'after insert on auth.users' is the standard for Supabase signup triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
