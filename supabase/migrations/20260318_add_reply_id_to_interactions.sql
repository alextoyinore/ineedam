-- Migration: Add reply_id to interaction tables
-- Created at: 2026-03-18

-- 1. Add reply_id to likes
ALTER TABLE public.likes ADD COLUMN IF NOT EXISTS reply_id UUID REFERENCES public.replies(id) ON DELETE CASCADE;
COMMENT ON COLUMN public.likes.reply_id IS 'Reference to the reply being liked';

-- 2. Add reply_id to bookmarks
ALTER TABLE public.bookmarks ADD COLUMN IF NOT EXISTS reply_id UUID REFERENCES public.replies(id) ON DELETE CASCADE;
COMMENT ON COLUMN public.bookmarks.reply_id IS 'Reference to the reply being bookmarked';

-- 3. Add reply_id to broadcasts
ALTER TABLE public.broadcasts ADD COLUMN IF NOT EXISTS reply_id UUID REFERENCES public.replies(id) ON DELETE CASCADE;
COMMENT ON COLUMN public.broadcasts.reply_id IS 'Reference to the reply being broadcast';

-- Indexing for performance
CREATE INDEX IF NOT EXISTS idx_likes_reply_id ON public.likes(reply_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_reply_id ON public.bookmarks(reply_id);
CREATE INDEX IF NOT EXISTS idx_broadcasts_reply_id ON public.broadcasts(reply_id);
