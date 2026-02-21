-- Migration: Add location to profiles table
alter table public.profiles 
add column if not exists location text;

-- No RLS changes needed as existing update policy covers all columns
-- create policy "Users can update own location" on profiles for update using (auth.uid() = id); 
-- is already covered by: create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
