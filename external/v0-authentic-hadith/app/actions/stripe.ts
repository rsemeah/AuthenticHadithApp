"use server";

import { PRODUCTS, type ProductId } from "@/lib/products";
import { stripe } from "@/lib/stripe";
import { getSupabaseServerClient } from "@/lib/supabase/server";

// Map product IDs to plan keys for the subscriptions table
const PRODUCT_TO_PLAN: Record<ProductId, string> = {
  monthly_intro: "premium_monthly",
  monthly: "premium_monthly",
  annual: "premium_yearly",
  lifetime: "lifetime",
};

export async function createCheckoutSession(productId: ProductId) {
  const product = PRODUCTS[productId];
  if (!product) {
    throw new Error(`Invalid product ID: ${productId}`);
  }

  const planKey = PRODUCT_TO_PLAN[productId];

  // Get current user
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be logged in to subscribe");
  }

  // Get the default price for this product from Stripe
  const prices = await stripe.prices.list({
    product: product.stripeProductId,
    active: true,
    limit: 1,
  });

  if (prices.data.length === 0) {
    throw new Error(`No active price found for product: ${product.name}`);
  }

  const priceId = prices.data[0].id;

  // Check if user has a Stripe customer ID
  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .single();

  let customerId = profile?.stripe_customer_id;

  // Create Stripe customer if doesn't exist
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: {
        supabase_user_id: user.id,
      },
    });
    customerId = customer.id;

    // Save customer ID to profile
    await supabase
      .from("profiles")
      .update({ stripe_customer_id: customerId })
      .eq("user_id", user.id);
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // Create embedded checkout session
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    client_reference_id: user.id, // Primary user ID for webhook
    mode: product.mode,
    payment_method_types: ["card"],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    ui_mode: "embedded",
    return_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    metadata: {
      supabase_user_id: user.id,
      plan_key: planKey, // Used by webhook to set plan column
    },
    ...(product.mode === "subscription"
      ? {
          subscription_data: {
            metadata: {
              supabase_user_id: user.id,
              plan_key: planKey,
            },
          },
        }
      : {}),
  });

  return {
    clientSecret: session.client_secret,
  };
}

export async function getCheckoutSession(sessionId: string) {
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["line_items", "customer"],
  });

  return {
    status: session.status,
    customerEmail:
      typeof session.customer === "object" &&
      session.customer &&
      "email" in session.customer
        ? ((session.customer as { email?: string | null }).email ?? null)
        : null,
  };
}
