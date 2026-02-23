-- Create a table for sensitive user security settings (like the message PIN)
CREATE TABLE IF NOT EXISTS public.user_security (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    message_pin_hash VARCHAR(255),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.user_security ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own security settings
CREATE POLICY "Users can view own security settings" ON public.user_security
    FOR SELECT
    USING (auth.uid() = id);

-- Allow users to insert their own security settings
CREATE POLICY "Users can insert own security settings" ON public.user_security
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Allow users to update their own security settings
CREATE POLICY "Users can update own security settings" ON public.user_security
    FOR UPDATE
    USING (auth.uid() = id);

-- Create a function to automatically insert a row into user_security when a profile is created
-- OR when an existing user first sets up their PIN.
-- We can also explicitly execute an insert/update via Supabase RPC or standard upsert.
-- Given Supabase's standard structure, Upserts work well. We don't necessarily need a trigger.
