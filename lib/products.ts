/**
 * Subscription product definitions.
 * Ported from v0-authentic-hadith for the mobile app.
 * Stripe integration will be added later via expo-stripe or RevenueCat.
 */

export interface Product {
  id: string;
  name: string;
  description: string;
  priceInCents: number;
  mode: "payment" | "subscription";
  interval?: "month" | "year";
  features: string[];
  highlighted?: boolean;
  badge?: string;
}

export const PRODUCTS: Product[] = [
  {
    id: "monthly-intro",
    name: "Monthly (Intro)",
    description:
      "Introductory monthly access for first-time members. Full access to all learning paths and AI explanations.",
    priceInCents: 499,
    mode: "subscription",
    interval: "month",
    badge: "Intro Offer",
    features: [
      "Full access to all collections",
      "AI-powered explanations",
      "All learning paths",
      "Save & bookmark hadiths",
      "Basic offline access",
    ],
  },
  {
    id: "monthly-premium",
    name: "Monthly Premium",
    description:
      "Unlimited access to authentic hadith collections, AI-powered explanations, learning paths, and progress tracking.",
    priceInCents: 999,
    mode: "subscription",
    interval: "month",
    features: [
      "Everything in Intro",
      "Advanced hadith search",
      "Priority AI assistant",
      "Progress tracking",
      "Custom reading lists",
    ],
  },
  {
    id: "annual-premium",
    name: "Annual Premium",
    description:
      "Full access to Authentic Hadith for one year. Best value for committed learners.",
    priceInCents: 4999,
    mode: "subscription",
    interval: "year",
    highlighted: true,
    badge: "Best Value",
    features: [
      "Everything in Monthly Premium",
      "Save 58% vs monthly",
      "Early access to new features",
      "Extended AI assistant usage",
      "Priority support",
    ],
  },
  {
    id: "lifetime-access",
    name: "Lifetime Access",
    description:
      "Lifetime access to Authentic Hadith, including all current and future core features.",
    priceInCents: 9999,
    mode: "payment",
    badge: "One-Time",
    features: [
      "Everything in Annual, forever",
      "All future features included",
      "No recurring charges",
      "Lifetime priority support",
      "Founding member recognition",
    ],
  },
];

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function getSubscriptionProducts() {
  return PRODUCTS.filter((p) => p.mode === "subscription");
}

export function getOneTimeProducts() {
  return PRODUCTS.filter((p) => p.mode === "payment");
}
