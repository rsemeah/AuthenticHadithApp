// Supabase Edge Function: check-streaks
// Schedule: Run daily at 11pm UTC to check streak health and send alerts
// Cron: 0 23 * * *
//
// SETUP:
// 1. Deploy: supabase functions deploy check-streaks
// 2. Set secrets: supabase secrets set EXPO_ACCESS_TOKEN=your-token
// 3. Schedule daily in Supabase Dashboard

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const EXPO_ACCESS_TOKEN = Deno.env.get("EXPO_ACCESS_TOKEN");

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

Deno.serve(async (_req) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

    // ============================================================
    // 1. Find users with active streaks who haven't logged in today
    //    (their streak is at risk)
    // ============================================================
    const { data: atRisk } = await supabase
      .from("user_streaks")
      .select("user_id, current_streak")
      .eq("last_active_date", yesterday)
      .gte("current_streak", 3); // Only alert if streak is 3+ days

    if (atRisk && atRisk.length > 0) {
      // Check notification preferences
      const riskUserIds = atRisk.map((u) => u.user_id);
      const { data: prefs } = await supabase
        .from("notification_preferences")
        .select("user_id")
        .in("user_id", riskUserIds)
        .eq("streak_alerts", true);

      const allowedIds = new Set((prefs ?? []).map((p) => p.user_id));
      const usersToNotify = atRisk.filter((u) => allowedIds.has(u.user_id));

      if (usersToNotify.length > 0) {
        // Get push tokens
        const { data: tokens } = await supabase
          .from("push_tokens")
          .select("user_id, token")
          .in(
            "user_id",
            usersToNotify.map((u) => u.user_id)
          )
          .eq("is_active", true);

        if (tokens && tokens.length > 0) {
          const tokenMap = new Map<string, string[]>();
          for (const t of tokens) {
            if (!tokenMap.has(t.user_id)) tokenMap.set(t.user_id, []);
            tokenMap.get(t.user_id)!.push(t.token);
          }

          const messages: any[] = [];
          const queueEntries: any[] = [];

          for (const user of usersToNotify) {
            const userTokens = tokenMap.get(user.user_id) ?? [];
            const body = `Don't lose your ${user.current_streak}-day streak! Open the app today to keep it alive.`;

            for (const token of userTokens) {
              messages.push({
                to: token,
                title: `${user.current_streak}-Day Streak at Risk!`,
                body,
                data: { type: "streak_at_risk" },
                channelId: "achievements",
                priority: "high",
              });
            }

            queueEntries.push({
              user_id: user.user_id,
              template_slug: "streak_at_risk",
              title: `${user.current_streak}-Day Streak at Risk!`,
              body,
              data: { streak_days: user.current_streak },
              channel: "push",
              priority: "urgent",
              status: "sent",
              sent_at: new Date().toISOString(),
            });
          }

          // Send pushes
          if (messages.length > 0) {
            for (let i = 0; i < messages.length; i += 100) {
              await fetch("https://exp.host/--/api/v2/push/send", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  ...(EXPO_ACCESS_TOKEN
                    ? { Authorization: `Bearer ${EXPO_ACCESS_TOKEN}` }
                    : {}),
                },
                body: JSON.stringify(messages.slice(i, i + 100)),
              });
            }
          }

          // Log notifications
          if (queueEntries.length > 0) {
            await supabase.from("notification_queue").insert(queueEntries);
          }
        }
      }
    }

    // ============================================================
    // 2. Reset broken streaks (users who missed yesterday)
    // ============================================================
    const twoDaysAgo = new Date(Date.now() - 172800000)
      .toISOString()
      .split("T")[0];

    await supabase
      .from("user_streaks")
      .update({ current_streak: 0, updated_at: new Date().toISOString() })
      .lt("last_active_date", yesterday)
      .gt("current_streak", 0);

    return new Response(
      JSON.stringify({
        message: "Streak check complete",
        at_risk_notified: atRisk?.length ?? 0,
      }),
      { status: 200 }
    );
  } catch (e) {
    console.error("Error:", e);
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
});
