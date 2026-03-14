-- =================================================================================
-- ENABLE EMAIL NOTIFICATIONS TRIGGER (PG_NET)
-- =================================================================================

-- 1. Ensure pg_net is enabled
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 2. Create the invoke function
CREATE OR REPLACE FUNCTION public.invoke_email_notification()
RETURNS trigger AS $$
DECLARE
  payload jsonb;
  service_role_key text := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93bGttdmdwdXp3bnBhcWlnZnVmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDY4MzIwNywiZXhwIjoyMDg2MjU5MjA3fQ.f9cX68Oe94fAhUpymyfdLTYgjpl-A9_OEdeLRK2lL1Q'; -- Service role key
BEGIN
  -- Construct payload
  payload := jsonb_build_object(
    'record', NEW -- Send the whole notification record
  );

  PERFORM
    net.http_post(
      url := 'https://owlkmvgpuzwnpaqigfuf.supabase.co/functions/v1/notify-email',
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
DROP TRIGGER IF EXISTS on_notification_created_email on public.notifications;
CREATE TRIGGER on_notification_created_email
AFTER INSERT ON public.notifications
FOR EACH ROW EXECUTE FUNCTION public.invoke_email_notification();
