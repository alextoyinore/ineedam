-- =================================================================================
-- UPDATE BROADCASTS AND BOOKMARKS TABLES
-- Supports broadcasting endorsements and bookmarking broadcasts.
-- Run this in your Supabase SQL Editor.
-- =================================================================================

-- 1. Update Broadcasts Table
-- Drop existing primary key (user_id, need_id) to allow optional need_id
ALTER TABLE public.broadcasts DROP CONSTRAINT IF EXISTS broadcasts_pkey;

-- Add a surrogate primary key if it doesn't exist
ALTER TABLE public.broadcasts ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid() PRIMARY KEY;

-- Make need_id optional
ALTER TABLE public.broadcasts ALTER COLUMN need_id DROP NOT NULL;

-- Add endorsement_id column
ALTER TABLE public.broadcasts ADD COLUMN IF NOT EXISTS endorsement_id UUID REFERENCES public.endorsements(id) ON DELETE CASCADE;

-- Add check constraint to ensure exactly one target is broadcasted
ALTER TABLE public.broadcasts DROP CONSTRAINT IF EXISTS broadcasts_target_check;
ALTER TABLE public.broadcasts ADD CONSTRAINT broadcasts_target_check CHECK (
  (need_id IS NOT NULL AND endorsement_id IS NULL) OR
  (need_id IS NULL AND endorsement_id IS NOT NULL)
);

-- Add unique indexes to prevent double-broadcasting same item per user
DROP INDEX IF EXISTS public.broadcasts_user_need_idx;
CREATE UNIQUE INDEX broadcasts_user_need_idx ON public.broadcasts (user_id, need_id) WHERE need_id IS NOT NULL;

DROP INDEX IF EXISTS public.broadcasts_user_endorsement_idx;
CREATE UNIQUE INDEX broadcasts_user_endorsement_idx ON public.broadcasts (user_id, endorsement_id) WHERE endorsement_id IS NOT NULL;


-- 2. Update Bookmarks Table
-- Add broadcast_id column
ALTER TABLE public.bookmarks ADD COLUMN IF NOT EXISTS broadcast_id UUID REFERENCES public.broadcasts(id) ON DELETE CASCADE;

-- Update check constraint to include broadcast_id
ALTER TABLE public.bookmarks DROP CONSTRAINT IF EXISTS bookmarks_target_check;
ALTER TABLE public.bookmarks ADD CONSTRAINT bookmarks_target_check CHECK (
  (need_id IS NOT NULL AND endorsement_id IS NULL AND broadcast_id IS NULL) OR
  (need_id IS NULL AND endorsement_id IS NOT NULL AND broadcast_id IS NULL) OR
  (need_id IS NULL AND endorsement_id IS NULL AND broadcast_id IS NOT NULL)
);

-- Add unique index for broadcast bookmarks
DROP INDEX IF EXISTS public.bookmarks_user_broadcast_idx;
CREATE UNIQUE INDEX bookmarks_user_broadcast_idx ON public.bookmarks (user_id, broadcast_id) WHERE broadcast_id IS NOT NULL;
