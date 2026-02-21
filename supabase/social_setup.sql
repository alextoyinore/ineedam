-- Update replies table for threading
ALTER TABLE public.replies 
ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES public.replies(id) ON DELETE CASCADE;

-- Create follows table
CREATE TABLE IF NOT EXISTS public.follows (
    follower_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    following_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (follower_id, following_id)
);

-- Enable RLS
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- Policies for follows
CREATE POLICY "Users can see who they follow and who follows them"
    ON public.follows FOR SELECT
    USING (auth.uid() = follower_id OR auth.uid() = following_id);

CREATE POLICY "Users can follow others"
    ON public.follows FOR INSERT
    WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow others"
    ON public.follows FOR DELETE
    USING (auth.uid() = follower_id);

-- Profile trigger update (optional but good for follower counts if we added columns later)
-- For now, we'll fetch counts via queries.
