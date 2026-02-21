-- 1. Create the likes table
CREATE TABLE IF NOT EXISTS public.likes (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  need_id UUID REFERENCES public.needs(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (user_id, need_id)
);

-- 2. Enable RLS
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
DROP POLICY IF EXISTS "Anyone can view likes" ON public.likes;
CREATE POLICY "Anyone can view likes" ON public.likes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can like needs" ON public.likes;
CREATE POLICY "Authenticated users can like needs" ON public.likes FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can unlike needs" ON public.likes;
CREATE POLICY "Users can unlike needs" ON public.likes FOR DELETE USING (auth.uid() = user_id);

-- 4. Notification Trigger for Likes
CREATE OR REPLACE FUNCTION public.handle_like_notification()
RETURNS trigger AS $$
DECLARE
  need_author_id UUID;
  liker_name TEXT;
  need_title TEXT;
BEGIN
  -- Get need details
  SELECT author_id, title INTO need_author_id, need_title FROM public.needs WHERE id = NEW.need_id;
  
  -- Get liker name
  SELECT display_name INTO liker_name FROM public.profiles WHERE id = NEW.user_id;

  -- Don't notify if you like your own post
  IF need_author_id != NEW.user_id THEN
    INSERT INTO public.notifications (user_id, actor_id, type, reference_id, message)
    VALUES (
      need_author_id,
      NEW.user_id,
      'like',
      NEW.need_id,
      'liked your need: ' || need_title
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_like_notification ON public.likes;
CREATE TRIGGER on_like_notification
AFTER INSERT ON public.likes
FOR EACH ROW EXECUTE FUNCTION public.handle_like_notification();

-- 5. Performance index
CREATE INDEX IF NOT EXISTS likes_need_id_idx ON public.likes(need_id);
