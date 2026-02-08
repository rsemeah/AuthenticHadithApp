import { stripe } from "@/lib/stripe";
import { STRIPE_CONFIG } from "@/lib/stripe/config";
import { SUPABASE_URL } from "@/lib/supabase/config";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

// Plan values matching DB schema
type PlanKey = "free" | "premium_monthly" | "premium_yearly" | "lifetime";

// Map price IDs to plan keys
const PRICE_TO_PLAN: Record<string, PlanKey> = {
  [STRIPE_CONFIG.prices.monthlyIntro]: "premium_monthly",
  [STRIPE_CONFIG.prices.monthly]: "premium_monthly",
  [STRIPE_CONFIG.prices.annual]: "premium_yearly",
  [STRIPE_CONFIG.prices.lifetime]: "lifetime",
};

// Lazy-initialized Supabase admin client
let _supabaseAdmin: SupabaseClient | null = null;
function getSupabaseAdmin(): SupabaseClient {
  if (!_supabaseAdmin) {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
    }
    _supabaseAdmin = createClient(
      SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
    );
  }
  return _supabaseAdmin;
}

/**
 * Sync subscription status from Stripe checkout session
 * Called immediately after checkout to ensure subscription is active
 * before user sees the success page - prevents "paid but still locked" issues
 */
export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
  }

  try {
    // Retrieve the completed session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription", "line_items.data.price"],
    });

    if (session.status !== "complete") {
      return NextResponse.json({
        synced: false,
        reason: "Session not complete",
      });
    }

    const userId =
      session.client_reference_id || session.metadata?.supabase_user_id;
    if (!userId) {
      return NextResponse.json({
        synced: false,
        reason: "No user ID in session",
      });
    }

    // Determine plan from line items or metadata
    const priceId = session.line_items?.data[0]?.price?.id;
    let plan: PlanKey = (session.metadata?.plan_key as PlanKey) || "free";

    if (priceId && PRICE_TO_PLAN[priceId]) {
      plan = PRICE_TO_PLAN[priceId];
    }

    const isLifetime = session.mode === "payment";
    const subscriptionId =
      typeof session.subscription === "string"
        ? session.subscription
        : session.subscription?.id || null;

    // Upsert subscription record immediately
    const { error } = await getSupabaseAdmin()
      .from("subscriptions")
      .upsert({
        user_id: userId,
        stripe_customer_id: session.customer as string,
        stripe_subscription_id: isLifetime ? null : subscriptionId,
        plan: isLifetime ? "lifetime" : plan,
        is_lifetime: isLifetime,
        status: "active",
        current_period_start: new Date().toISOString(),
        current_period_end: isLifetime ? null : calculatePeriodEnd(session),
        cancel_at_period_end: false,
      });

    if (error) {
      console.error("Failed to sync subscription:", error);
      return NextResponse.json(
        {
          synced: false,
          reason: "Database error",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      synced: true,
      plan: isLifetime ? "lifetime" : plan,
      isLifetime,
    });
  } catch (error) {
    console.error("Subscription sync error:", error);
    return NextResponse.json(
      {
        synced: false,
        reason: "Stripe API error",
      },
      { status: 500 },
    );
  }
}

function calculatePeriodEnd(session: any): string | null {
  // For subscriptions, try to get period end from the subscription object
  if (session.subscription && typeof session.subscription === "object") {
    const sub = session.subscription;
    if (sub.current_period_end) {
      return new Date(sub.current_period_end * 1000).toISOString();
    }
  }

  // Fallback: estimate based on interval
  const priceId = session.line_items?.data[0]?.price?.id;
  const now = new Date();

  if (priceId === STRIPE_CONFIG.prices.annual) {
    now.setFullYear(now.getFullYear() + 1);
    return now.toISOString();
  }

  // Default: monthly
  now.setMonth(now.getMonth() + 1);
  return now.toISOString();
}
