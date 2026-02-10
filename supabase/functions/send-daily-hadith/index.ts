// Supabase Edge Function: send-daily-hadith
// Schedule: Run every hour via cron to respect user timezone preferences
// Cron: 0 * * * * (every hour, checks which users should receive at this hour)
//
// SETUP:
// 1. Deploy: supabase functions deploy send-daily-hadith
// 2. Set secrets: supabase secrets set EXPO_ACCESS_TOKEN=your-token
// 3. Schedule hourly in Supabase Dashboard

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const EXPO_ACCESS_TOKEN = Deno.env.get("EXPO_ACCESS_TOKEN");

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

Deno.serve(async (_req) => {
  try {
    const now = new Date();
    const currentHour = now.getUTCHours().toString().padStart(2, "0");
    const timeMatch = `${currentHour}:00`;

    // Find users who want daily hadith at this hour (UTC)
    const { data: prefs } = await supabase
      .from("notification_preferences")
      .select("user_id")
      .eq("daily_hadith", true)
      .eq("daily_hadith_time", timeMatch);

    if (!prefs || prefs.length === 0) {
      return new Response(
        JSON.stringify({ message: "No users scheduled for this hour", count: 0 }),
        { status: 200 }
      );
    }

    const userIds = prefs.map((p) => p.user_id);

    // Get active push tokens for these users
    const { data: tokens } = await supabase
      .from("push_tokens")
      .select("user_id, token")
      .in("user_id", userIds)
      .eq("is_active", true);

    if (!tokens || tokens.length === 0) {
      return new Response(
        JSON.stringify({ message: "No active push tokens", count: 0 }),
        { status: 200 }
      );
    }

    // Get a random hadith
    const { data: hadith } = await supabase
      .from("hadith")
      .select("id, collection_name, english_text, grading, reference")
      .not("english_text", "is", null)
      .limit(1)
      .order("id") // Will use random via offset
      .range(
        Math.floor(Math.random() * 36000),
        Math.floor(Math.random() * 36000)
      );

    const h = hadith?.[0];
    if (!h) {
      return new Response(JSON.stringify({ error: "No hadith found" }), {
        status: 500,
      });
    }

    const preview =
      h.english_text.slice(0, 100) +
      (h.english_text.length > 100 ? "..." : "");

    // Build Expo push messages
    const messages = tokens.map((t) => ({
      to: t.token,
      title: "Your Daily Hadith",
      body: preview,
      subtitle: h.collection_name,
      data: { hadithId: h.id, type: "daily_hadith" },
      channelId: "daily-hadith",
      priority: "default" as const,
    }));

    // Send via Expo Push API in chunks of 100
    let sent = 0;
    for (let i = 0; i < messages.length; i += 100) {
      const chunk = messages.slice(i, i + 100);
      const res = await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(EXPO_ACCESS_TOKEN
            ? { Authorization: `Bearer ${EXPO_ACCESS_TOKEN}` }
            : {}),
        },
        body: JSON.stringify(chunk),
      });

      if (res.ok) {
        sent += chunk.length;
      } else {
        console.error("Expo push error:", await res.text());
      }
    }

    // Log to notification queue for each user
    const queueEntries = [...new Set(tokens.map((t) => t.user_id))].map(
      (uid) => ({
        user_id: uid,
        template_slug: "daily_hadith",
        title: "Your Daily Hadith",
        body: preview,
        data: { hadithId: h.id },
        channel: "push",
        priority: "normal",
        status: "sent",
        sent_at: new Date().toISOString(),
      })
    );

    await supabase.from("notification_queue").insert(queueEntries);

    return new Response(
      JSON.stringify({ message: "Daily hadith sent", sent, total: tokens.length }),
      { status: 200 }
    );
  } catch (e) {
    console.error("Error:", e);
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
});
