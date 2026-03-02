-- =================================================================================
-- MASTER NOTIFICATION TRIGGERS
-- This script ensures all major social events insert a row into the notifications table.
-- =================================================================================

-- 1. FOLLOW NOTIFICATION
CREATE OR REPLACE FUNCTION public.handle_follow_notification()
RETURNS trigger AS $$
DECLARE
  follower_name TEXT;
BEGIN
  SELECT display_name INTO follower_name FROM public.profiles WHERE id = NEW.follower_id;

  INSERT INTO public.notifications (user_id, actor_id, type, message)
  VALUES (
    NEW.following_id,
    NEW.follower_id,
    'follow',
    'started following you'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_follow_notification ON public.follows;
CREATE TRIGGER on_follow_notification
AFTER INSERT ON public.follows
FOR EACH ROW EXECUTE FUNCTION public.handle_follow_notification();


-- 2. REPLY NOTIFICATION
CREATE OR REPLACE FUNCTION public.handle_reply_notification()
RETURNS trigger AS $$
DECLARE
  need_author_id UUID;
  replier_name TEXT;
  need_title TEXT;
  parent_reply_author_id UUID;
BEGIN
  -- Get need details
  SELECT user_id, title INTO need_author_id, need_title FROM public.needs WHERE id = NEW.need_id;
  SELECT display_name INTO replier_name FROM public.profiles WHERE id = NEW.user_id;

  -- 1. Notify the Need Author
  IF need_author_id != NEW.user_id THEN
    INSERT INTO public.notifications (user_id, actor_id, type, reference_id, message)
    VALUES (
      need_author_id,
      NEW.user_id,
      'reply',
      NEW.need_id,
      'replied to your need: ' || need_title
    );
  END IF;

  -- 2. Notify Parent Reply Author (if it's a nested reply)
  IF NEW.parent_id IS NOT NULL THEN
    SELECT user_id INTO parent_reply_author_id FROM public.replies WHERE id = NEW.parent_id;
    
    IF parent_reply_author_id IS NOT NULL AND parent_reply_author_id != NEW.user_id AND parent_reply_author_id != need_author_id THEN
      INSERT INTO public.notifications (user_id, actor_id, type, reference_id, message)
      VALUES (
        parent_reply_author_id,
        NEW.user_id,
        'reply_message',
        NEW.need_id,
        'replied to your comment on: ' || need_title
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_reply_notification ON public.replies;
CREATE TRIGGER on_reply_notification
AFTER INSERT ON public.replies
FOR EACH ROW EXECUTE FUNCTION public.handle_reply_notification();


-- 3. MESSAGE NOTIFICATION
CREATE OR REPLACE FUNCTION public.handle_message_notification()
RETURNS trigger AS $$
DECLARE
  recipient_id UUID;
  sender_name TEXT;
BEGIN
  -- Find the other participant in the thread
  SELECT user_id INTO recipient_id 
  FROM public.thread_participants 
  WHERE thread_id = NEW.thread_id AND user_id != NEW.sender_id
  LIMIT 1;

  IF recipient_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, actor_id, type, reference_id, message)
    VALUES (
      recipient_id,
      NEW.sender_id,
      'message',
      NEW.thread_id,
      -- Snippet of the message
      CASE 
        WHEN length(NEW.text) > 60 THEN left(NEW.text, 57) || '...'
        ELSE NEW.text
      END
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_message_notification ON public.messages;
CREATE TRIGGER on_message_notification
AFTER INSERT ON public.messages
FOR EACH ROW EXECUTE FUNCTION public.handle_message_notification();


-- 4. BOOKMARK NOTIFICATION
CREATE OR REPLACE FUNCTION public.handle_bookmark_notification()
RETURNS trigger AS $$
DECLARE
  need_author_id UUID;
  need_title TEXT;
BEGIN
  SELECT user_id, title INTO need_author_id, need_title FROM public.needs WHERE id = NEW.need_id;

  IF need_author_id != NEW.user_id THEN
    INSERT INTO public.notifications (user_id, actor_id, type, reference_id, message)
    VALUES (
      need_author_id,
      NEW.user_id,
      'bookmark',
      NEW.need_id,
      'bookmarked your need: ' || need_title
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_bookmark_notification ON public.bookmarks;
CREATE TRIGGER on_bookmark_notification
AFTER INSERT ON public.bookmarks
FOR EACH ROW EXECUTE FUNCTION public.handle_bookmark_notification();


-- 5. NEW NEED NOTIFICATION (Notify Followers)
CREATE OR REPLACE FUNCTION public.handle_new_need_notification()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.notifications (user_id, actor_id, type, reference_id, message)
  SELECT 
    follower_id, 
    NEW.user_id, 
    'new_need', 
    NEW.id, 
    'posted a new need: ' || NEW.title
  FROM public.follows 
  WHERE following_id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_new_need_notification ON public.needs;
CREATE TRIGGER on_new_need_notification
AFTER INSERT ON public.needs
FOR EACH ROW EXECUTE FUNCTION public.handle_new_need_notification();

-- 6. UNFOLLOW NOTIFICATION
CREATE OR REPLACE FUNCTION public.handle_unfollow_notification()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.notifications (user_id, actor_id, type, message)
  VALUES (
    OLD.following_id,
    OLD.follower_id,
    'unfollow',
    'stopped following you'
  );
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_unfollow_notification ON public.follows;
CREATE TRIGGER on_unfollow_notification
AFTER DELETE ON public.follows
FOR EACH ROW EXECUTE FUNCTION public.handle_unfollow_notification();


-- 7. NEED UPDATE NOTIFICATION (Notify Followers on status/title change)
CREATE OR REPLACE FUNCTION public.handle_need_update_notification()
RETURNS trigger AS $$
BEGIN
  -- Only notify if status or title has changed to avoid spam on minor edits
  IF (NEW.status IS DISTINCT FROM OLD.status) OR (NEW.title IS DISTINCT FROM OLD.title) THEN
    INSERT INTO public.notifications (user_id, actor_id, type, reference_id, message)
    SELECT 
      follower_id, 
      NEW.user_id, 
      'need_update', 
      NEW.id, 
      CASE 
        WHEN NEW.status IS DISTINCT FROM OLD.status THEN 'updated need status to ' || NEW.status || ': ' || NEW.title
        ELSE 'updated need: ' || NEW.title
      END
    FROM public.follows 
    WHERE following_id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_need_update_notification ON public.needs;
CREATE TRIGGER on_need_update_notification
AFTER UPDATE ON public.needs
FOR EACH ROW EXECUTE FUNCTION public.handle_need_update_notification();
