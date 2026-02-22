-- =================================================================================
-- UPDATE BOOKMARKS TABLE
-- Supports bookmarking both needs and endorsements.
-- Run this in your Supabase SQL Editor.
-- =================================================================================

-- 1. Drop existing primary key and constraints
ALTER TABLE public.bookmarks DROP CONSTRAINT IF EXISTS bookmarks_pkey;

-- 2. Add a surrogate primary key
ALTER TABLE public.bookmarks ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid() PRIMARY KEY;

-- 3. Make need_id optional and add endorsement_id
ALTER TABLE public.bookmarks ALTER COLUMN need_id DROP NOT NULL;
ALTER TABLE public.bookmarks ADD COLUMN IF NOT EXISTS endorsement_id UUID REFERENCES public.endorsements(id) ON DELETE CASCADE;

-- 4. Add check constraint to ensure exactly one target is bookmarked
-- First, remove any existing check if we are re-running
ALTER TABLE public.bookmarks DROP CONSTRAINT IF EXISTS bookmarks_target_check;
ALTER TABLE public.bookmarks ADD CONSTRAINT bookmarks_target_check CHECK (
  (need_id IS NOT NULL AND endorsement_id IS NULL) OR
  (need_id IS NULL AND endorsement_id IS NOT NULL)
);

-- 5. Add unique indexes to prevent double-bookmarking same item per user
DROP INDEX IF EXISTS public.bookmarks_user_need_idx;
CREATE UNIQUE INDEX bookmarks_user_need_idx ON public.bookmarks (user_id, need_id) WHERE need_id IS NOT NULL;

DROP INDEX IF EXISTS public.bookmarks_user_endorsement_idx;
CREATE UNIQUE INDEX bookmarks_user_endorsement_idx ON public.bookmarks (user_id, endorsement_id) WHERE endorsement_id IS NOT NULL;

-- 6. Enable Realtime if not already
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookmarks;
