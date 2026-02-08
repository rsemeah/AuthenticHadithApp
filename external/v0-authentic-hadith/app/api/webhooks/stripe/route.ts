import { stripe } from "@/lib/stripe";
import { STRIPE_CONFIG } from "@/lib/stripe/config";
import { SUPABASE_URL } from "@/lib/supabase/config";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

// Plan values matching DB schema: free|premium_monthly|premium_yearly|lifetime
type PlanKey = "free" | "premium_monthly" | "premium_yearly" | "lifetime";

// Map price IDs to plan keys
const PRICE_TO_PLAN: Record<string, PlanKey> = {
  [STRIPE_CONFIG.prices.monthlyIntro]: "premium_monthly",
  [STRIPE_CONFIG.prices.monthly]: "premium_monthly",
  [STRIPE_CONFIG.prices.annual]: "premium_yearly",
  [STRIPE_CONFIG.prices.lifetime]: "lifetime",
};

// Lazy-initialized Supabase admin client (bypasses RLS)
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

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || "",
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Dedupe: Check if we've already processed this event
  const { error: insertError } = await getSupabaseAdmin()
    .from("stripe_events")
    .insert({
      event_id: event.id,
      event_type: event.type,
      payload: event.data.object,
      // received_at defaults to NOW(), processed_at is null until we finish
    });

  if (insertError) {
    // If insert fails due to duplicate, we've already processed this event
    if (insertError.code === "23505") {
      // unique_violation
      console.log("Duplicate event, skipping:", event.id);
      return NextResponse.json({ received: true, duplicate: true });
    }
    // Log other errors but continue processing
    console.warn("Failed to record event (continuing anyway):", insertError);
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCanceled(subscription);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentSucceeded(invoice);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }
    }

    // Mark event as processed
    await getSupabaseAdmin()
      .from("stripe_events")
      .update({ processed_at: new Date().toISOString() })
      .eq("event_id", event.id);

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 },
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  // client_reference_id is the primary source, fallback to metadata
  const userId =
    session.client_reference_id || session.metadata?.supabase_user_id;
  const planKey = session.metadata?.plan_key as PlanKey | undefined;

  if (!userId) {
    console.error(
      "No user ID in checkout session (client_reference_id or metadata)",
    );
    return;
  }

  const isLifetime = session.mode === "payment";
  const plan = planKey || (isLifetime ? "lifetime" : "free");

  // For one-time payments (lifetime), create a subscription record with is_lifetime = true
  if (isLifetime) {
    await getSupabaseAdmin()
      .from("subscriptions")
      .upsert({
        user_id: userId,
        stripe_customer_id: session.customer as string,
        stripe_subscription_id: null, // One-time payment, no subscription
        plan,
        is_lifetime: true,
        status: "active",
        current_period_start: new Date().toISOString(),
        current_period_end: null, // Lifetime = no end
        cancel_at_period_end: false,
      });
  }
  // For subscriptions, the subscription.created event will handle the record
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  // Try metadata first, then look up by customer ID
  let userId = subscription.metadata?.supabase_user_id;

  if (!userId) {
    // Try to find user by customer ID
    const { data: existingSub } = await getSupabaseAdmin()
      .from("subscriptions")
      .select("user_id, is_lifetime")
      .eq("stripe_customer_id", subscription.customer)
      .single();

    if (existingSub) {
      // CRITICAL: Protect lifetime users from subscription events
      if (existingSub.is_lifetime) {
        console.log(
          "Skipping subscription update for lifetime user:",
          existingSub.user_id,
        );
        return;
      }
      userId = existingSub.user_id;
    } else {
      console.error("Could not find user for subscription:", subscription.id);
      return;
    }
  } else {
    // Check if this user already has lifetime
    const { data: existingSub } = await getSupabaseAdmin()
      .from("subscriptions")
      .select("is_lifetime")
      .eq("user_id", userId)
      .single();

    if (existingSub?.is_lifetime) {
      console.log("Skipping subscription update for lifetime user:", userId);
      return;
    }
  }

  await updateSubscription(userId, subscription);
}

async function updateSubscription(
  userId: string,
  subscription: Stripe.Subscription,
) {
  const plan = getPlanFromSubscription(subscription);

  // Access billing cycle dates from subscription items
  const subscriptionItem = subscription.items.data[0];
  const currentPeriodStart = subscriptionItem?.current_period_start
    ? new Date(subscriptionItem.current_period_start * 1000).toISOString()
    : new Date().toISOString();
  const currentPeriodEnd = subscriptionItem?.current_period_end
    ? new Date(subscriptionItem.current_period_end * 1000).toISOString()
    : null;

  await getSupabaseAdmin()
    .from("subscriptions")
    .upsert({
      user_id: userId,
      stripe_customer_id: subscription.customer as string,
      stripe_subscription_id: subscription.id,
      plan,
      is_lifetime: false, // Subscriptions are never lifetime
      status: subscription.status,
      current_period_start: currentPeriodStart,
      current_period_end: currentPeriodEnd,
      cancel_at_period_end: subscription.cancel_at_period_end,
    });
}

function getPlanFromSubscription(subscription: Stripe.Subscription): PlanKey {
  const priceId = subscription.items.data[0]?.price?.id;
  if (priceId && PRICE_TO_PLAN[priceId]) {
    return PRICE_TO_PLAN[priceId];
  }
  // Fallback to metadata
  const metadataPlan = subscription.metadata?.plan_key as PlanKey | undefined;
  return metadataPlan || "free";
}

async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
  const { data: existingSub } = await getSupabaseAdmin()
    .from("subscriptions")
    .select("user_id, is_lifetime")
    .eq("stripe_subscription_id", subscription.id)
    .single();

  if (existingSub) {
    // CRITICAL: Never downgrade lifetime users
    if (existingSub.is_lifetime) {
      console.log(
        "Ignoring subscription cancellation for lifetime user:",
        existingSub.user_id,
      );
      return;
    }

    await getSupabaseAdmin()
      .from("subscriptions")
      .update({
        status: "canceled",
        plan: "free", // Downgrade to free on cancellation
        cancel_at_period_end: true,
      })
      .eq("stripe_subscription_id", subscription.id);
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  // Log successful payment for analytics
  console.log("Payment succeeded for invoice:", invoice.id);
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  // Could send notification to user about failed payment
  console.log("Payment failed for invoice:", invoice.id);
}
