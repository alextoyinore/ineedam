# Email Notifications Setup Guide (cPanel SMTP)

## Step 1: Set Supabase Secrets

Run these commands in your terminal (replace values with your cPanel SMTP details):

```bash
supabase secrets set SMTP_HOST=mail.ineedam.com
supabase secrets set SMTP_PORT=587
supabase secrets set SMTP_USER=notifications@ineedam.com
supabase secrets set SMTP_PASS=your-cpanel-email-password
```

You can find your cPanel SMTP settings in:
**cPanel → Email Accounts → Connect Devices → Mail Client Manual Settings**

## Step 2: Run Database Migrations

In your Supabase SQL Editor, run these scripts **in order**:

1. `add_email_notifications.sql` — adds `email` and `email_notifications_enabled` to profiles
2. `enable_email_notifications.sql` — creates the trigger that calls the edge function

## Step 3: Deploy the Edge Function

```bash
supabase functions deploy notify-email
```

## Step 4: Verify

1. Go to your Supabase project → Edge Functions → `notify-email`
2. Check logs after a follow/reply/endorsement event
3. The recipient should receive an email from `notifications@ineedam.com`

## Environment Variables Used

| Secret | Example Value | Description |
|---|---|---|
| `SMTP_HOST` | `mail.ineedam.com` | cPanel mail server |
| `SMTP_PORT` | `587` | STARTTLS port (or 465 for SSL) |
| `SMTP_USER` | `notifications@ineedam.com` | The sender email address |
| `SMTP_PASS` | `yourpassword` | cPanel email account password |

## Notification Types Supported

| Type | When Triggered | Subject |
|---|---|---|
| `follow` | Someone follows the user | "X started following you" |
| `reply` | Someone replies to their need | "X replied to you" |
| `new_need` | A followed user posts a need | "X posted a new need" |
| `endorsement` | User receives an endorsement | "🎉 You received an endorsement" |
| `mention` | User is @mentioned | "X mentioned you" |

## User Opt-out

Users can disable email notifications at any time via **Settings → Notifications → Email Notifications** toggle.
