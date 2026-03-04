-- Migration: Add file attachment support to needs and replies
-- This adds file_url and file_type to both tables to support arbitrary file uploads.

-- 1. Update needs table
ALTER TABLE public.needs 
ADD COLUMN IF NOT EXISTS file_url TEXT,
ADD COLUMN IF NOT EXISTS file_type TEXT;

-- 2. Update replies table
ALTER TABLE public.replies 
ADD COLUMN IF NOT EXISTS file_url TEXT,
ADD COLUMN IF NOT EXISTS file_type TEXT;

-- NOTE: RLS policies generally use (auth.uid() = user_id) or (true) for select,
-- so adding columns doesn't require updating existing policies unless they 
-- specifically restrict which columns can be inserted/updated.
-- In our case, the policies are broad enough.

-- Comment on columns for clarity
COMMENT ON COLUMN public.needs.file_url IS 'URL of an attached file (PDF, etc.) for this need';
COMMENT ON COLUMN public.needs.file_type IS 'MIME type of the attached file for this need';
COMMENT ON COLUMN public.replies.file_url IS 'URL of an attached file (PDF, etc.) for this reply';
COMMENT ON COLUMN public.replies.file_type IS 'MIME type of the attached file for this reply';
