import Stripe from "stripe";

// Server-only Stripe client
// Only use this in API routes, server actions, and server components
// Lazy-initialized to prevent build failures when env vars aren't set
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-12-18.acacia",
      typescript: true,
    });
  }
  return _stripe;
}

// For backwards compatibility - use getStripe() in new code
export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    return (getStripe() as any)[prop];
  },
});
