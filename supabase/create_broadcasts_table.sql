-- =================================================================================
-- BROADCASTS TABLE
-- Allows users to broadcast (retweet-style) a need to their followers
-- Run this in your Supabase SQL Editor
-- =================================================================================

-- 1. Create the broadcasts table
CREATE TABLE IF NOT EXISTS public.broadcasts (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  need_id UUID REFERENCES public.needs(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (user_id, need_id)
);

-- 2. Enable RLS
ALTER TABLE public.broadcasts ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
DROP POLICY IF EXISTS "Anyone can view broadcasts" ON public.broadcasts;
CREATE POLICY "Anyone can view broadcasts" ON public.broadcasts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can broadcast needs" ON public.broadcasts;
CREATE POLICY "Authenticated users can broadcast needs" ON public.broadcasts FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can remove their own broadcasts" ON public.broadcasts;
CREATE POLICY "Users can remove their own broadcasts" ON public.broadcasts FOR DELETE USING (auth.uid() = user_id);

-- 4. Notification Trigger for Broadcasts
CREATE OR REPLACE FUNCTION public.handle_broadcast_notification()
RETURNS trigger AS $$
DECLARE
  need_author_id UUID;
  broadcaster_name TEXT;
  need_title TEXT;
BEGIN
  -- Get need details (note: needs table uses user_id, not author_id)
  SELECT user_id, title INTO need_author_id, need_title FROM public.needs WHERE id = NEW.need_id;

  -- Get broadcaster name
  SELECT display_name INTO broadcaster_name FROM public.profiles WHERE id = NEW.user_id;

  -- Don't notify if you broadcast your own need
  IF need_author_id != NEW.user_id THEN
    INSERT INTO public.notifications (user_id, actor_id, type, reference_id, message)
    VALUES (
      need_author_id,
      NEW.user_id,
      'broadcast',
      NEW.need_id,
      'broadcast your need: ' || need_title
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_broadcast_notification ON public.broadcasts;
CREATE TRIGGER on_broadcast_notification
AFTER INSERT ON public.broadcasts
FOR EACH ROW EXECUTE FUNCTION public.handle_broadcast_notification();

-- 5. Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.broadcasts;

-- 6. Performance index
CREATE INDEX IF NOT EXISTS broadcasts_need_id_idx ON public.broadcasts(need_id);
CREATE INDEX IF NOT EXISTS broadcasts_user_id_idx ON public.broadcasts(user_id);
