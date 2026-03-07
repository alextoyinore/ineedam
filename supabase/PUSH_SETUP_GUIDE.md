# Push Notification Setup Guide (Database Webhooks)

Since the `pg_net` extension is not available in your current Supabase environment, you should use **Database Webhooks** via the Supabase Dashboard. This is the UI-managed alternative to SQL triggers for calling Edge Functions.

## 1. Create the Webhook

1. Go to your **Supabase Dashboard**.
2. Navigate to **Database** -> **Webhooks**.
3. Click **Enable Webhooks** (if not already enabled).
4. Click **Create Webhook**.

## 2. Webhook Configuration

- **Name**: `notify_push_webhook`
- **Table**: `notifications`
- **Events**: Check `INSERT`
- **Type**: `Supabase Edge Function`
- **Edge Function**: Select `notify-push`
- **Method**: `POST`
- **Timeout**: `5000`

## 3. Transformations/Payload (IMPORTANT)

The `notify-push` function is already updated to handle the standard webhook format. You don't need to change anything in the dashboard's "HTTP Body" section; it will send the data automatically.

---

## 4. Redeploy Edge Function

Make sure to redeploy your Edge Function so it has the latest code to handle the webhook:
`supabase functions deploy notify-push`
