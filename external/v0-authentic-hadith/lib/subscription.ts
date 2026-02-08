import { getSupabaseServerClient } from "@/lib/supabase/server";

// Plan values matching DB schema
export type UserTier =
  | "free"
  | "premium_monthly"
  | "premium_yearly"
  | "lifetime";

export interface SubscriptionData {
  user_id: string;
  plan: UserTier;
  is_lifetime: boolean;
  status: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
}

/**
 * Get the user's current subscription tier
 * Returns "free" if no subscription or user is not authenticated
 */
export async function getUserTier(): Promise<UserTier> {
  const supabase = await getSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return "free";
  }

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("plan, status, is_lifetime")
    .eq("user_id", user.id)
    .single();

  if (!subscription) {
    return "free";
  }

  // Lifetime users are always premium regardless of status
  if (subscription.is_lifetime) {
    return "lifetime";
  }

  // Check if subscription is active
  if (subscription.status !== "active" && subscription.status !== "trialing") {
    return "free";
  }

  return subscription.plan as UserTier;
}

/**
 * Get full subscription data for the current user
 * Returns null if no subscription exists
 */
export async function getSubscription(): Promise<SubscriptionData | null> {
  const supabase = await getSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return null;
  }

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .single();

  return subscription as SubscriptionData | null;
}

/**
 * Check if user has premium access (any non-free tier)
 */
export async function isPremium(): Promise<boolean> {
  const tier = await getUserTier();
  return tier !== "free";
}

/**
 * Require premium access - throws if user is free tier
 * Use in Server Actions or API routes to gate premium content
 */
export async function requirePremium(): Promise<UserTier> {
  const tier = await getUserTier();

  if (tier === "free") {
    throw new Error("Premium subscription required");
  }

  return tier;
}

/**
 * Get user tier without throwing - returns tier and whether they have premium
 * Useful for conditionally showing content in server components
 */
export async function checkPremiumAccess(): Promise<{
  tier: UserTier;
  isPremium: boolean;
  isLifetime: boolean;
}> {
  const tier = await getUserTier();

  return {
    tier,
    isPremium: tier !== "free",
    isLifetime: tier === "lifetime",
  };
}
