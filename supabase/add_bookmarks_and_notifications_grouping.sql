-- Migration: Message Bookmarks and Grouped Notifications

-- 0. Fix column naming collision if necessary
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='messages' AND column_name='content'
    ) THEN
        ALTER TABLE public.messages RENAME COLUMN content TO text;
    END IF;
END $$;

-- 1. Create table for message bookmarks
CREATE TABLE IF NOT EXISTS public.message_bookmarks (
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (user_id, message_id)
);

-- Enable RLS for bookmarks
ALTER TABLE public.message_bookmarks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own message bookmarks" ON public.message_bookmarks;
CREATE POLICY "Users can view own message bookmarks" ON public.message_bookmarks
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can add message bookmarks" ON public.message_bookmarks;
CREATE POLICY "Users can add message bookmarks" ON public.message_bookmarks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can remove message bookmarks" ON public.message_bookmarks;
CREATE POLICY "Users can remove message bookmarks" ON public.message_bookmarks
    FOR DELETE USING (auth.uid() = user_id);

-- Enable Realtime for message bookmarks (ignore if already added)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'message_bookmarks'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.message_bookmarks;
    END IF;
END $$;

-- 2. Add group_count to notifications
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS group_count INTEGER DEFAULT 1;

-- 3. Update notification grouping logic for messages
CREATE OR REPLACE FUNCTION public.handle_message_notification()
RETURNS trigger AS $$
DECLARE
  recipient_id UUID;
  existing_notif_id UUID;
BEGIN
  -- Find the other participant in the thread
  SELECT user_id INTO recipient_id 
  FROM public.thread_participants 
  WHERE thread_id = NEW.thread_id AND user_id != NEW.sender_id
  LIMIT 1;

  IF recipient_id IS NOT NULL THEN
    -- Check for an existing unread message notification for this thread
    SELECT id INTO existing_notif_id
    FROM public.notifications
    WHERE user_id = recipient_id 
      AND reference_id = NEW.thread_id 
      AND type = 'message' 
      AND read = false
    LIMIT 1;

    IF existing_notif_id IS NOT NULL THEN
      -- Update existing notification
      UPDATE public.notifications
      SET 
        message = CASE 
                    WHEN length(NEW.text) > 60 THEN left(NEW.text, 57) || '...'
                    ELSE NEW.text
                  END,
        actor_id = NEW.sender_id,
        group_count = group_count + 1,
        created_at = now()
      WHERE id = existing_notif_id;
    ELSE
      -- Insert new notification
      INSERT INTO public.notifications (user_id, actor_id, type, reference_id, message, group_count)
      VALUES (
        recipient_id,
        NEW.sender_id,
        'message',
        NEW.thread_id,
        CASE 
          WHEN length(NEW.text) > 60 THEN left(NEW.text, 57) || '...'
          ELSE NEW.text
        END,
        1
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-apply trigger
DROP TRIGGER IF EXISTS on_message_notification ON public.messages;
CREATE TRIGGER on_message_notification
AFTER INSERT ON public.messages
FOR EACH ROW EXECUTE FUNCTION public.handle_message_notification();
