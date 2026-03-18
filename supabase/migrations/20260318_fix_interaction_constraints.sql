-- Migration: Fix primary keys for interactions (likes, bookmarks, broadcasts)
-- Created at: 2026-03-18

-- ==========================================
-- 1. LIKES TABLE
-- ==========================================
-- Drop existing primary key (user_id, need_id) which prevents need_id from being null
ALTER TABLE public.likes DROP CONSTRAINT IF EXISTS likes_pkey;

-- Add a UUID primary key if it doesn't exist
ALTER TABLE public.likes ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid();
-- Safe guard to ensure id becomes the primary key
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'likes_pkey'
    ) THEN
        ALTER TABLE public.likes ADD PRIMARY KEY (id);
    END IF;
END $$;

-- Drop NOT NULL constraint on need_id
ALTER TABLE public.likes ALTER COLUMN need_id DROP NOT NULL;

-- Add partial unique constraints to ensure a user can only like a specific item once
CREATE UNIQUE INDEX IF NOT EXISTS idx_likes_unique_need ON public.likes (user_id, need_id) WHERE need_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_likes_unique_reply ON public.likes (user_id, reply_id) WHERE reply_id IS NOT NULL;

-- Fix check constraint
ALTER TABLE public.likes DROP CONSTRAINT IF EXISTS likes_target_check;

-- Clean up invalid rows before applying the constraint
DELETE FROM public.likes WHERE ((need_id IS NOT NULL)::integer + (reply_id IS NOT NULL)::integer) <> 1;

ALTER TABLE public.likes ADD CONSTRAINT likes_target_check CHECK (
    (need_id IS NOT NULL)::integer + 
    (reply_id IS NOT NULL)::integer = 1
);



-- ==========================================
-- 2. BOOKMARKS TABLE
-- ==========================================
-- Drop existing primary key (user_id, need_id) which prevents need_id from being null
ALTER TABLE public.bookmarks DROP CONSTRAINT IF EXISTS bookmarks_pkey;

-- Add a UUID primary key if it doesn't exist
ALTER TABLE public.bookmarks ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid();
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'bookmarks_pkey'
    ) THEN
        ALTER TABLE public.bookmarks ADD PRIMARY KEY (id);
    END IF;
END $$;

-- Drop NOT NULL constraint on need_id
ALTER TABLE public.bookmarks ALTER COLUMN need_id DROP NOT NULL;

-- Add partial unique constraints
CREATE UNIQUE INDEX IF NOT EXISTS idx_bookmarks_unique_need ON public.bookmarks (user_id, need_id) WHERE need_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_bookmarks_unique_reply ON public.bookmarks (user_id, reply_id) WHERE reply_id IS NOT NULL;

-- Fix check constraint
ALTER TABLE public.bookmarks DROP CONSTRAINT IF EXISTS bookmarks_target_check;

-- Clean up invalid rows before applying the constraint
DELETE FROM public.bookmarks WHERE ((need_id IS NOT NULL)::integer + (reply_id IS NOT NULL)::integer) <> 1;

ALTER TABLE public.bookmarks ADD CONSTRAINT bookmarks_target_check CHECK (
    (need_id IS NOT NULL)::integer + 
    (reply_id IS NOT NULL)::integer = 1
);



-- ==========================================
-- 3. BROADCASTS TABLE
-- ==========================================
-- Check if broadcasts has a composite primary key or if it already has 'id'. 
-- Drop it if it's named broadcasts_pkey and contains need_id
DO $$
BEGIN
    -- Only drop the constraint if it's a composite key or preventing our change
    -- It's safer to just attempt to drop NOT NULL if 'need_id' is NOT the PK, 
    -- but if it IS the PK, we must drop it.
    IF EXISTS (
        SELECT 1 FROM pg_index i
        JOIN pg_class c ON c.oid = i.indrelid
        JOIN pg_attribute a ON a.attrelid = c.oid AND a.attnum = ANY(i.indkey)
        WHERE c.relname = 'broadcasts' AND a.attname = 'need_id' AND i.indisprimary
    ) THEN
        ALTER TABLE public.broadcasts DROP CONSTRAINT IF EXISTS broadcasts_pkey;
        
        -- Add id if missing
        ALTER TABLE public.broadcasts ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid();
        ALTER TABLE public.broadcasts ADD PRIMARY KEY (id);
    END IF;
END $$;

-- Now drop NOT NULL constraint on need_id
ALTER TABLE public.broadcasts ALTER COLUMN need_id DROP NOT NULL;

-- Add partial unique constraints
CREATE UNIQUE INDEX IF NOT EXISTS idx_broadcasts_unique_need ON public.broadcasts (user_id, need_id) WHERE need_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_broadcasts_unique_reply ON public.broadcasts (user_id, reply_id) WHERE reply_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_broadcasts_unique_endorsement ON public.broadcasts (user_id, endorsement_id) WHERE endorsement_id IS NOT NULL;

-- Fix check constraint
ALTER TABLE public.broadcasts DROP CONSTRAINT IF EXISTS broadcasts_target_check;

-- Clean up invalid rows before applying the constraint
DELETE FROM public.broadcasts WHERE ((need_id IS NOT NULL)::integer + (endorsement_id IS NOT NULL)::integer + (reply_id IS NOT NULL)::integer) <> 1;

ALTER TABLE public.broadcasts ADD CONSTRAINT broadcasts_target_check CHECK (
    (need_id IS NOT NULL)::integer + 
    (endorsement_id IS NOT NULL)::integer + 
    (reply_id IS NOT NULL)::integer = 1
);
