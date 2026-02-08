import { stripe } from "@/lib/stripe";
import { PLANS } from "@/lib/stripe/config";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { priceId, planId } = await request.json();

    if (!priceId) {
      return NextResponse.json(
        { error: "Price ID is required" },
        { status: 400 },
      );
    }

    // Validate the price ID is one of our plans
    const plan = PLANS.find((p) => p.priceId === priceId);
    if (!plan) {
      return NextResponse.json({ error: "Invalid price ID" }, { status: 400 });
    }

    // Get current user from Supabase
    const supabase = await getSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "You must be logged in to subscribe" },
        { status: 401 },
      );
    }

    // Check if user already has a Stripe customer ID
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

    // Determine if this is a subscription or one-time payment
    const isOneTime = plan.interval === null;

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: isOneTime ? "payment" : "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/settings?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/pricing?canceled=true`,
      metadata: {
        supabase_user_id: user.id,
        plan_id: planId,
      },
      ...(isOneTime
        ? {}
        : {
            subscription_data: {
              metadata: {
                supabase_user_id: user.id,
                plan_id: planId,
              },
            },
          }),
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 },
    );
  }
}
