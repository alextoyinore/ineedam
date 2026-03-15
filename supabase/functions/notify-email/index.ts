// @ts-nocheck
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

// cPanel SMTP Credentials — set via: supabase secrets set SMTP_HOST=... etc.
const SMTP_HOST = Deno.env.get("SMTP_HOST")!;       // e.g. mail.ineedam.com
const SMTP_PORT = parseInt(Deno.env.get("SMTP_PORT") || "587");
const SMTP_USER = Deno.env.get("SMTP_USER")!;       // e.g. notifications@ineedam.com
const SMTP_PASS = Deno.env.get("SMTP_PASS")!;
const FROM_NAME = "Ineedam Notifications";
const FROM_EMAIL = Deno.env.get("SMTP_USER")!;

serve(async (req: Request) => {
    const client = new SmtpClient();
    try {
        const body_json = await req.json();

        // Handle Supabase Webhook format (from pg_net trigger)
        const isWebhook = body_json.record !== undefined;
        const payloadData = isWebhook ? body_json.record : body_json;

        const userId = payloadData.user_id || payloadData.userId;
        const actorId = payloadData.actor_id;
        const type = payloadData.type;
        const message = payloadData.message || "You have a new update on Ineedam";
        const referenceId = payloadData.reference_id || payloadData.referenceId;

        if (!userId) throw new Error("userId is required");

        // 0. Explicitly skip "like" notifications (keep them in-app only)
        if (type === "like") {
            console.log(`Skipping email notification for type: like`);
            return new Response(JSON.stringify({ success: true, message: "Skipped like notification" }), { status: 200 });
        }

        // Initialise Supabase with service role to access emails
        const supabase = createClient(
            Deno.env.get("SUPABASE_URL")!,
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
        );

        // 1. Fetch Recipient (email + preferences)
        const { data: recipient, error: recipientError } = await supabase
            .from("profiles")
            .select("email, email_notifications_enabled, display_name, username")
            .eq("id", userId)
            .single();

        if (recipientError || !recipient?.email) {
            console.log(`No email found for user ${userId}. Skipping.`);
            return new Response(JSON.stringify({ success: false, message: "No recipient email" }), { status: 200 });
        }

        // 2. Check if user has opted in
        if (recipient.email_notifications_enabled === false) {
            console.log(`Email notifications disabled for user ${userId}.`);
            return new Response(JSON.stringify({ success: false, message: "Notifications disabled" }), { status: 200 });
        }

        // 3. Fetch Actor (for personalised content)
        const { data: actor } = await supabase
            .from("profiles")
            .select("display_name, username")
            .eq("id", actorId)
            .single();

        const actorName = actor?.display_name || actor?.username || "Someone";
        const recipientName = recipient.display_name || recipient.username || "there";

        // 4. Build subject + action URL
        let subject = "New activity on Ineedam";
        let actionUrl = "https://ineedam.com/notifications";

        if (type === "follow") {
            subject = `${actorName} started following you on Ineedam`;
        } else if (type === "reply" || type === "reply_message") {
            subject = `${actorName} replied to you on Ineedam`;
            actionUrl = `https://ineedam.com/need/${referenceId}`;
        } else if (type === "new_need") {
            subject = `${actorName} posted a new need`;
            actionUrl = `https://ineedam.com/need/${referenceId}`;
        } else if (type === "endorsement") {
            subject = `🎉 You received an endorsement from ${actorName}!`;
            actionUrl = `https://ineedam.com/profile/${userId}?tab=endorsements`;
        } else if (type === "mention") {
            subject = `${actorName} mentioned you on Ineedam`;
            actionUrl = `https://ineedam.com/need/${referenceId}`;
        }

        // 5. Build HTML email body
        const htmlBody = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0f0f17;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:32px 16px;">
    <!-- Header -->
    <div style="text-align:center;margin-bottom:32px;">
      <h1 style="margin:0;font-size:28px;font-weight:800;background:linear-gradient(135deg,#6366f1,#8b5cf6);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">
        iNeedAm
      </h1>
    </div>

    <!-- Card -->
    <div style="background:#1a1a2e;border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:32px;">
      <p style="margin:0 0 8px 0;color:#a0a0b8;font-size:14px;">Hi ${recipientName},</p>
      <h2 style="margin:0 0 16px 0;color:#ffffff;font-size:20px;font-weight:700;">${subject}</h2>
      <p style="margin:0 0 28px 0;color:#c0c0d8;font-size:15px;line-height:1.6;">${message}</p>

      <a href="${actionUrl}"
         style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;text-decoration:none;padding:12px 28px;border-radius:9999px;font-weight:700;font-size:15px;">
        View Details →
      </a>
    </div>

    <!-- Footer -->
    <div style="margin-top:24px;text-align:center;">
      <p style="color:#606070;font-size:12px;margin:0;">
        You're receiving this because you follow activity on Ineedam.<br/>
        <a href="https://ineedam.com/settings" style="color:#6366f1;text-decoration:none;">Manage notification preferences</a>
      </p>
    </div>
  </div>
</body>
</html>`;

        // 6. Connect to cPanel SMTP and send
        await client.connectTLS({
            hostname: SMTP_HOST,
            port: SMTP_PORT,
            username: SMTP_USER,
            password: SMTP_PASS,
        });

        await client.send({
            from: `${FROM_NAME} <${FROM_EMAIL}>`,
            to: recipient.email,
            subject: subject,
            content: `Hi ${recipientName},\n\n${message}\n\nView details: ${actionUrl}\n\n---\nManage notification preferences: https://ineedam.com/settings`,
            html: htmlBody,
        });

        await client.close();
        console.log(`Email sent to ${recipient.email} (type: ${type})`);

        return new Response(JSON.stringify({ success: true }), {
            headers: { "Content-Type": "application/json" },
            status: 200,
        });
    } catch (error: unknown) {
        try { await client.close(); } catch (_) { /* ignore */ }
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("Email notification error:", message);
        return new Response(JSON.stringify({ error: message }), {
            headers: { "Content-Type": "application/json" },
            status: 500,
        });
    }
});
