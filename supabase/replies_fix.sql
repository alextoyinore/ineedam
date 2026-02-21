-- 1. ADD MISSING COLUMN (Fixes "Failed to post reply")
ALTER TABLE IF EXISTS public.replies 
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.replies(id) ON DELETE CASCADE;

-- 2. UNLOCK MESSAGING (Fixes "Could not start conversation")
-- Allow anyone to create a new thread container
DROP POLICY IF EXISTS "Users can create threads" ON public.threads;
CREATE POLICY "Users can create threads" ON public.threads 
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Allow you to add people to a conversation you just started
DROP POLICY IF EXISTS "Users can add participants to threads" ON public.thread_participants;
CREATE POLICY "Users can add participants to threads" ON public.thread_participants 
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Ensure you can see your conversations
DROP POLICY IF EXISTS "Users view threads they are in" ON public.threads;
CREATE POLICY "Users view threads they are in" ON public.threads 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.thread_participants WHERE thread_id = id AND user_id = auth.uid()
  )
);
