-- Migration: Add met_by_id to needs table
alter table public.needs 
add column if not exists met_by_id uuid references public.profiles(id);

-- Update status check if any (currently it's just a text column)
-- 'fulfilled' was previously used in comments, we'll shift to 'met' and 'archived' in UI
