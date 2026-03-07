-- =================================================================================
-- ENABLE PUSH NOTIFICATIONS TRIGGER (PG_NET)
-- =================================================================================

-- 1. Enable pg_net
-- We use "pg_net" here as the extension name.
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 2. Create the function
CREATE OR REPLACE FUNCTION public.invoke_push_notification()
RETURNS trigger AS $$
DECLARE
  payload jsonb;
  service_role_key text := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93bGttdmdwdXp3bnBhcWlnZnVmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDY4MzIwNywiZXhwIjoyMDg2MjU5MjA3fQ.f9cX68Oe94fAhUpymyfdLTYgjpl-A9_OEdeLRK2lL1Q'; -- <--- REPLACE THIS WITH YOUR KEY
BEGIN
  -- Construct smart URL
  payload := jsonb_build_object(
    'userId', NEW.user_id,
    'title', 'Ineedam',
    'body', NEW.message,
    'url', CASE 
      WHEN NEW.type = 'message' THEN '/messages/' || NEW.reference_id
      WHEN NEW.type IN ('reply', 'reply_message', 'mention', 'new_need', 'need_update') THEN '/need/' || NEW.reference_id
      ELSE '/notifications'
    END
  );

  PERFORM
    net.http_post(
      url := 'https://owlkmvgpuzwnpaqigfuf.supabase.co/functions/v1/notify-push',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || service_role_key
      ),
      body := payload
    );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Add trigger
DROP TRIGGER IF EXISTS on_notification_created_push on public.notifications;
CREATE TRIGGER on_notification_created_push
AFTER INSERT ON public.notifications
FOR EACH ROW EXECUTE FUNCTION public.invoke_push_notification();
