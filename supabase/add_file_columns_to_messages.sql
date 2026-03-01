-- =================================================================================
-- ADD FILE ATTACHMENT COLUMNS TO MESSAGES
-- Allows messages to carry an optional Cloudinary file URL and its MIME type.
-- Run this in your Supabase SQL Editor.
-- =================================================================================

ALTER TABLE public.messages
    ADD COLUMN IF NOT EXISTS file_url  TEXT,
    ADD COLUMN IF NOT EXISTS file_type TEXT;  -- e.g. 'image/png', 'application/pdf'
