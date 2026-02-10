/**
 * XP Engine — award points, calculate tiers, check badges.
 */
import { supabase } from "./supabase";

// ============================================================
// Talib Rating Tiers
// ============================================================
export const TIERS = [
  { key: "talib", name: "Talib", arabic: "طالب", xpRequired: 0, color: "#666666" },
  { key: "mutaallim", name: "Mutaallim", arabic: "متعلم", xpRequired: 100, color: "#2e7d32" },
  { key: "murid", name: "Murid", arabic: "مريد", xpRequired: 500, color: "#1565c0" },
  { key: "hafidh", name: "Hafidh", arabic: "حافظ", xpRequired: 1500, color: "#6a1b9a" },
  { key: "muhaddith", name: "Muhaddith", arabic: "محدث", xpRequired: 3500, color: "#e65100" },
  { key: "alim", name: "Alim", arabic: "عالم", xpRequired: 7000, color: "#c62828" },
  { key: "scholar", name: "Scholar of Hadith", arabic: "عالم الحديث", xpRequired: 15000, color: "#c9a84c" },
] as const;

export type TierKey = (typeof TIERS)[number]["key"];

export function getTierInfo(tierKey: string) {
  return TIERS.find((t) => t.key === tierKey) ?? TIERS[0];
}

export function getTierByXP(xp: number) {
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (xp >= TIERS[i].xpRequired) return TIERS[i];
  }
  return TIERS[0];
}

export function getNextTier(tierKey: string) {
  const idx = TIERS.findIndex((t) => t.key === tierKey);
  if (idx < 0 || idx >= TIERS.length - 1) return null;
  return TIERS[idx + 1];
}

export function getXPProgress(totalXP: number) {
  const current = getTierByXP(totalXP);
  const next = getNextTier(current.key);
  if (!next) return { current, next: null, progress: 1, xpInTier: 0, xpNeeded: 0 };

  const xpInTier = totalXP - current.xpRequired;
  const xpNeeded = next.xpRequired - current.xpRequired;
  const progress = Math.min(xpInTier / xpNeeded, 1);

  return { current, next, progress, xpInTier, xpNeeded };
}

// ============================================================
// XP Actions
// ============================================================
export const XP_VALUES = {
  quiz_correct: 10,
  lesson_complete: 25,
  quiz_perfect_bonus: 50,
  streak_day: 5,
  path_complete: 200,
  share_hadith: 3,
  referral: 100,
} as const;

/**
 * Award XP via the server-side function.
 */
export async function awardXP(
  userId: string,
  amount: number,
  action: string
): Promise<{ total_xp: number; tier: string; tier_changed: boolean } | null> {
  const { data, error } = await supabase.rpc("award_xp", {
    p_user_id: userId,
    p_amount: amount,
    p_action: action,
  });

  if (error) {
    console.error("Award XP error:", error);
    return null;
  }
  return data;
}

/**
 * Record daily activity and update streak.
 */
export async function recordDailyActivity(
  userId: string
): Promise<{ current_streak: number; milestone: boolean } | null> {
  const { data, error } = await supabase.rpc("record_daily_activity", {
    p_user_id: userId,
  });

  if (error) {
    console.error("Record activity error:", error);
    return null;
  }
  return data;
}

/**
 * Fetch user XP data.
 */
export async function getUserXP(userId: string) {
  const { data } = await supabase
    .from("user_xp")
    .select("*")
    .eq("user_id", userId)
    .single();
  return data;
}

/**
 * Fetch user streak data.
 */
export async function getUserStreak(userId: string) {
  const { data } = await supabase
    .from("user_streaks")
    .select("*")
    .eq("user_id", userId)
    .single();
  return data;
}

/**
 * Fetch user's earned badges.
 */
export async function getUserBadges(userId: string) {
  const { data } = await supabase
    .from("user_badges")
    .select("*")
    .eq("user_id", userId)
    .order("earned_at", { ascending: false });
  return data ?? [];
}

/**
 * Fetch all badge definitions.
 */
export async function getBadgeDefinitions() {
  const { data } = await supabase
    .from("badge_definitions")
    .select("*")
    .order("sort_order");
  return data ?? [];
}

/**
 * Check and award badges based on current stats. Called after XP changes.
 */
export async function checkAndAwardBadges(userId: string): Promise<string[]> {
  const [xpData, streakData, badges, definitions] = await Promise.all([
    getUserXP(userId),
    getUserStreak(userId),
    getUserBadges(userId),
    getBadgeDefinitions(),
  ]);

  if (!xpData || !definitions) return [];

  const earnedSlugs = new Set(badges.map((b) => b.badge_slug));
  const newBadges: string[] = [];

  for (const def of definitions) {
    if (earnedSlugs.has(def.slug)) continue;

    let earned = false;

    switch (def.criteria_type) {
      case "lessons_completed":
        earned = xpData.lessons_completed >= def.criteria_value;
        break;
      case "streak_days":
        earned = (streakData?.current_streak ?? 0) >= def.criteria_value;
        break;
      case "quizzes_perfect":
        earned = xpData.quizzes_perfect >= def.criteria_value;
        break;
      case "referrals":
        earned = xpData.referrals_completed >= def.criteria_value;
        break;
      case "hadith_shared":
        earned = xpData.hadith_shared >= def.criteria_value;
        break;
      case "path_complete":
        // Checked separately via path completion logic
        break;
      case "all_paths_complete":
        // Checked separately
        break;
    }

    if (earned) {
      const { error } = await supabase.from("user_badges").insert({
        user_id: userId,
        badge_slug: def.slug,
        badge_name: def.name,
        badge_description: def.description,
        badge_icon: def.icon,
        xp_awarded: def.xp_reward,
      });

      if (!error) {
        newBadges.push(def.slug);
        // Award bonus XP for the badge
        if (def.xp_reward > 0) {
          await awardXP(userId, def.xp_reward, "badge");
        }
      }
    }
  }

  return newBadges;
}
