import { stripe } from "@/lib/stripe";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// Create a Stripe Customer Portal session for managing subscriptions
export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "You must be logged in" },
        { status: 401 },
      );
    }

    // Get user's Stripe customer ID
    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .single();

    if (!profile?.stripe_customer_id) {
      return NextResponse.json(
        { error: "No subscription found" },
        { status: 404 },
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;

    // Create customer portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${baseUrl}/settings`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error("Portal error:", error);
    return NextResponse.json(
      { error: "Failed to create portal session" },
      { status: 500 },
    );
  }
}
