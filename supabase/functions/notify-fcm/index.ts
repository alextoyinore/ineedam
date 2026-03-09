import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

serve(async (req) => {
    try {
        const body_json = await req.json();

        // Handle both direct calls and Supabase Webhook format
        const isWebhook = body_json.record !== undefined;
        const payloadData = isWebhook ? body_json.record : body_json;

        const userId = payloadData.user_id || payloadData.userId;
        const title = payloadData.title || "Ineedam";
        const message = payloadData.message || payloadData.body || "You have a new update";
        const type = payloadData.type;
        const referenceId = payloadData.reference_id || payloadData.referenceId;

        if (!userId) throw new Error("userId is required");

        // Construct URL based on notification type
        let url = "/notifications";
        if (type === 'message') {
            url = `/messages/${referenceId}`;
        } else if (['reply', 'reply_message', 'mention', 'new_need', 'need_update'].includes(type)) {
            url = `/need/${referenceId}`;
        }

        // Initialize Supabase client with service role key for unrestricted access
        const supabase = createClient(
            Deno.env.get("SUPABASE_URL")!,
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
        );

        // Fetch the user's FCM token
        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("fcm_token")
            .eq("id", userId)
            .single();

        if (profileError || !profile?.fcm_token) {
            console.log(`No FCM token found for user ${userId}`);
            return new Response(
                JSON.stringify({ success: false, message: "No FCM token" }),
                { status: 200 }
            );
        }

        const FIREBASE_SERVER_KEY = Deno.env.get("FIREBASE_SERVER_KEY")!;
        if (!FIREBASE_SERVER_KEY) throw new Error("FIREBASE_SERVER_KEY not configured");

        // Send FCM notification via Firebase Legacy HTTP API
        const fcmResponse = await fetch("https://fcm.googleapis.com/fcm/send", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `key=${FIREBASE_SERVER_KEY}`,
            },
            body: JSON.stringify({
                to: profile.fcm_token,
                notification: {
                    title: title,
                    body: message,
                    icon: "/icon.svg",
                    badge: "/badge.png",
                    click_action: url,
                },
                data: {
                    url: url,
                },
            }),
        });

        const fcmResult = await fcmResponse.json();
        console.log("[FCM] Sent notification:", fcmResult);

        return new Response(JSON.stringify({ success: true, fcm: fcmResult }), {
            headers: { "Content-Type": "application/json" },
            status: 200,
        });
    } catch (error) {
        console.error("FCM error:", error.message);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { "Content-Type": "application/json" },
            status: 500,
        });
    }
});
