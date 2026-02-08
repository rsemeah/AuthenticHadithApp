// Supabase Edge Function: send-inactive-reminder
// Schedule: Run daily via cron (Supabase Dashboard → Edge Functions → Schedule)
// Cron expression: 0 14 * * * (daily at 2pm UTC)
//
// SETUP REQUIRED:
// 1. Deploy: supabase functions deploy send-inactive-reminder
// 2. Set secrets:
//    supabase secrets set RESEND_API_KEY=re_xxxxx
//    supabase secrets set FROM_EMAIL=salaam@authentichadith.app
// 3. Schedule in Supabase Dashboard

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "salaam@authentichadith.app";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

Deno.serve(async (_req) => {
  try {
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    // Find users who:
    // - Haven't been seen in 14+ days
    // - Have opted in to emails
    // - Haven't been nudged in the last 14 days (no spam)
    const { data: inactiveUsers, error } = await supabase
      .from("profiles")
      .select("id, email, display_name, last_seen_at, last_nudge_sent_at")
      .eq("email_opt_in", true)
      .not("email", "is", null)
      .lte("last_seen_at", fourteenDaysAgo.toISOString())
      .or(
        `last_nudge_sent_at.is.null,last_nudge_sent_at.lte.${fourteenDaysAgo.toISOString()}`
      );

    if (error) {
      console.error("Query error:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
      });
    }

    if (!inactiveUsers || inactiveUsers.length === 0) {
      return new Response(
        JSON.stringify({ message: "No inactive users to notify", count: 0 }),
        { status: 200 }
      );
    }

    let sent = 0;
    let failed = 0;

    for (const user of inactiveUsers) {
      if (!RESEND_API_KEY) {
        console.log(`[DRY RUN] Would send reminder to ${user.email}`);
        sent++;
        continue;
      }

      try {
        const name = user.display_name || "there";

        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: `AuthenticHadith.App <${FROM_EMAIL}>`,
            to: [user.email],
            subject: `Assalamu Alaikum ${name} — your hadith journey awaits`,
            html: buildEmailHtml(name),
          }),
        });

        if (res.ok) {
          sent++;
          // Update nudge timestamp
          await supabase
            .from("profiles")
            .update({ last_nudge_sent_at: new Date().toISOString() })
            .eq("id", user.id);
        } else {
          const errBody = await res.text();
          console.error(`Failed to send to ${user.email}:`, errBody);
          failed++;
        }
      } catch (e) {
        console.error(`Error sending to ${user.email}:`, e);
        failed++;
      }
    }

    return new Response(
      JSON.stringify({
        message: "Reminder job complete",
        total: inactiveUsers.length,
        sent,
        failed,
      }),
      { status: 200 }
    );
  } catch (e) {
    console.error("Unexpected error:", e);
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
});

function buildEmailHtml(name: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#f5f5f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;padding:24px;">
    <tr>
      <td style="background:#1a5e3a;border-radius:12px 12px 0 0;padding:32px 24px;text-align:center;">
        <p style="font-size:22px;color:#c9a84c;margin:0 0 4px 0;">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</p>
        <h1 style="color:#fff;font-size:20px;margin:0;">Authentic Hadith</h1>
      </td>
    </tr>
    <tr>
      <td style="background:#ffffff;padding:28px 24px;">
        <p style="font-size:16px;color:#1a1a1a;line-height:1.6;margin:0 0 16px 0;">
          Assalamu Alaikum ${name},
        </p>
        <p style="font-size:15px;color:#444;line-height:1.6;margin:0 0 16px 0;">
          It's been a little while since you explored authentic hadith. The Prophet ﷺ said:
        </p>
        <blockquote style="border-left:3px solid #1a5e3a;margin:0 0 16px 0;padding:12px 16px;background:#f5f5f0;border-radius:0 8px 8px 0;">
          <p style="font-size:15px;color:#1a1a1a;margin:0;font-style:italic;">
            "The best of you are those who learn the Qur'an and teach it."
          </p>
          <p style="font-size:12px;color:#666;margin:8px 0 0 0;">— Sahih al-Bukhari</p>
        </blockquote>
        <p style="font-size:15px;color:#444;line-height:1.6;margin:0 0 24px 0;">
          Your learning journey is waiting. Come back and discover something new today.
        </p>
        <a href="authentichadith://"
           style="display:inline-block;background:#1a5e3a;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:15px;">
          Open Authentic Hadith
        </a>
      </td>
    </tr>
    <tr>
      <td style="background:#f5f5f0;padding:16px 24px;border-radius:0 0 12px 12px;text-align:center;">
        <p style="font-size:12px;color:#999;margin:0;">
          You're receiving this because you signed up for Authentic Hadith and opted in to reminders.
          <br>
          To stop receiving these emails, disable "Email reminders" in your app settings.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
