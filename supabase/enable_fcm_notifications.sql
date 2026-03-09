-- =====================================================================================
-- Enable FCM (Firebase Cloud Messaging) notifications via Supabase Database Webhook
-- =====================================================================================
-- Instead of a SQL trigger (which requires pg_net), we recommend setting up a
-- Supabase Database Webhook in the Dashboard:
--
-- 1. Go to: Dashboard → Database → Webhooks → Create new webhook
-- 2. Name: notify_fcm_on_notification
-- 3. Table: notifications
-- 4. Events: INSERT
-- 5. URL: https://owlkmvgpuzwnpaqigfuf.supabase.co/functions/v1/notify-fcm
-- 6. HTTP headers:
--    Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>
--    Content-Type: application/json
--
-- Alternatively, if you want a SQL trigger approach (requires pg_net extension):

CREATE OR REPLACE FUNCTION public.invoke_fcm_notification()
RETURNS trigger AS $$
DECLARE
  payload jsonb;
  service_role_key text := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93bGttdmdwdXp3bnBhcWlnZnVmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDY4MzIwNywiZXhwIjoyMDg2MjU5MjA3fQ.f9cX68Oe94fAhUpymyfdLTYgjpl-A9_OEdeLRK2lL1Q';
BEGIN
  payload := jsonb_build_object(
    'userId', NEW.user_id,
    'title', 'Ineedam',
    'body', NEW.message,
    'type', NEW.type,
    'reference_id', NEW.reference_id
  );

  PERFORM
    net.http_post(
      url := 'https://owlkmvgpuzwnpaqigfuf.supabase.co/functions/v1/notify-fcm',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || service_role_key
      ),
      body := payload
    );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_notification_created_fcm ON public.notifications;
CREATE TRIGGER on_notification_created_fcm
AFTER INSERT ON public.notifications
FOR EACH ROW EXECUTE FUNCTION public.invoke_fcm_notification();
