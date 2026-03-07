import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import * as webpush from "https://esm.sh/web-push@3.6.7";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY")!;
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY")!;

webpush.setVapidDetails(
    "mailto:admin@ineedam.com",
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
);

serve(async (req) => {
    try {
        const body_json = await req.json();

        // Handle both direct calls and Supabase Webbook format
        const isWebhook = body_json.record !== undefined;
        const payloadData = isWebhook ? body_json.record : body_json;

        const userId = payloadData.user_id || payloadData.userId;
        const title = payloadData.title || "Ineedam";
        const message = payloadData.message || payloadData.body || "You have a new update";
        const type = payloadData.type;
        const referenceId = payloadData.reference_id || payloadData.referenceId;

        if (!userId) throw new Error("userId is required");

        // Construct URL based on type
        let url = "/notifications";
        if (type === 'message') {
            url = `/messages/${referenceId}`;
        } else if (['reply', 'reply_message', 'mention', 'new_need', 'need_update'].includes(type)) {
            url = `/need/${referenceId}`;
        }

        // Initialize Supabase Client
        const supabase = createClient(
            Deno.env.get("SUPABASE_URL")!,
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
        );

        // Fetch User's Push Subscription
        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("push_subscription")
            .eq("id", userId)
            .single();

        if (profileError || !profile?.push_subscription) {
            console.log(`No subscription found for user ${userId}`);
            return new Response(JSON.stringify({ success: false, message: "No subscription" }), { status: 200 });
        }

        const payload = JSON.stringify({
            title: title,
            body: message,
            url: url,
        });

        await webpush.sendNotification(profile.push_subscription, payload);

        return new Response(JSON.stringify({ success: true }), {
            headers: { "Content-Type": "application/json" },
            status: 200,
        });
    } catch (error) {
        console.error("Push error:", error.message);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { "Content-Type": "application/json" },
            status: 500,
        });
    }
});
