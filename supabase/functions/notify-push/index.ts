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
        const { userId, title, body, url } = await req.json();

        if (!userId) throw new Error("userId is required");

        // Initialize Supabase Client
        const supabase = createClient(
            Deno.env.get("SUPABASE_URL")!,
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
        );

        // Fetch User's Push Subscription
        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("push_subscription, display_name")
            .eq("id", userId)
            .single();

        if (profileError || !profile?.push_subscription) {
            console.log(`No subscription found for user ${userId}`);
            return new Response(JSON.stringify({ success: false, message: "No subscription" }), { status: 200 });
        }

        const payload = JSON.stringify({
            title: title || "ineedam",
            body: body || "You have a new update",
            url: url || "/",
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
