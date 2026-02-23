-- Create user_blocks table to track blocked users
CREATE TABLE IF NOT EXISTS public.user_blocks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    blocker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    blocked_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(blocker_id, blocked_id)
);

-- Enable RLS for user_blocks
ALTER TABLE public.user_blocks ENABLE ROW LEVEL SECURITY;

-- Blockers can manage their own blocks
CREATE POLICY "Users can manage their own blocks" ON public.user_blocks
    FOR ALL
    USING (auth.uid() = blocker_id);

-- Create user_reports table to track user reports
CREATE TABLE IF NOT EXISTS public.user_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reported_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for user_reports
ALTER TABLE public.user_reports ENABLE ROW LEVEL SECURITY;

-- Reporters can insert their own reports
CREATE POLICY "Users can insert their own reports" ON public.user_reports
    FOR INSERT
    WITH CHECK (auth.uid() = reporter_id);

-- Reporters can view their own reports
CREATE POLICY "Users can view their own reports" ON public.user_reports
    FOR SELECT
    USING (auth.uid() = reporter_id);
