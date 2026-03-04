-- Migration: Add Chat Replies and Reactions
-- 1. Add reply_to column to messages table
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS reply_to UUID REFERENCES public.messages(id) ON DELETE SET NULL;

-- 2. Create message_reactions table
CREATE TABLE IF NOT EXISTS public.message_reactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    emoji TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(message_id, user_id, emoji)
);

-- 3. Enable RLS
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for message_reactions
DROP POLICY IF EXISTS "Anyone can view reactions" ON public.message_reactions;
CREATE POLICY "Anyone can view reactions" ON public.message_reactions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can toggle their own reactions" ON public.message_reactions;
CREATE POLICY "Users can toggle their own reactions" ON public.message_reactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reactions" ON public.message_reactions
  FOR DELETE USING (auth.uid() = user_id);

-- 5. Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.message_reactions;

-- 6. Indexes for performance
CREATE INDEX IF NOT EXISTS message_reactions_message_id_idx ON public.message_reactions(message_id);
CREATE INDEX IF NOT EXISTS messages_reply_to_idx ON public.messages(reply_to);
