-- Run this in your Supabase SQL Editor if you created the `profiles` table
-- before the `banner_url` feature was added.
-- This will safely add the missing column to your existing table.

alter table public.profiles 
add column if not exists banner_url text;
