-- Add status column to replies table to support archival
ALTER TABLE public.replies 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'active' CHECK (status IN ('active', 'archived'));

-- Index for better filtering performance
CREATE INDEX IF NOT EXISTS idx_replies_status ON public.replies(status);
