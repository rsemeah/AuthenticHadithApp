// Stripe configuration
// Add your Stripe keys and price IDs to environment variables

export const STRIPE_CONFIG = {
  // Publishable key (safe for client-side)
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",

  // Price IDs from Stripe Dashboard
  prices: {
    lifetime:
      process.env.STRIPE_PRICE_LIFETIME || "price_1SyR5Q2Nr0wloqqfNFPBCVwG", // $99.99 one-time
    monthly:
      process.env.STRIPE_PRICE_MONTHLY || "price_1SyR5Q2Nr0wloqqfhm98bf1B", // $9.99/month
    monthlyIntro:
      process.env.STRIPE_PRICE_MONTHLY_INTRO ||
      "price_1SyR5Q2Nr0wloqqfkSZCGYKV", // $4.99/month (intro)
    annual: process.env.STRIPE_PRICE_ANNUAL || "price_1SyR5Q2Nr0wloqqfzPIDtYVk", // $49.99/year
  },

  // Product IDs (for reference)
  products: {
    lifetime: "prod_TwJiLLwEm4kwBJ",
    monthly: "prod_TwJiYHi7QRpGqJ",
    monthlyIntro: "prod_TwJihTwf0x4hmv",
    annual: "prod_TwJiyXNERmzQwW",
  },
} as const;

// Plan metadata for UI display
export const PLANS = [
  {
    id: "monthly_intro",
    name: "Monthly (Intro)",
    description: "First-time members special",
    price: 4.99,
    interval: "month" as const,
    priceId: STRIPE_CONFIG.prices.monthlyIntro,
    savings: null as string | null,
    features: [
      "Unlimited hadith access",
      "AI-powered explanations",
      "Learning paths",
      "Progress tracking",
    ],
    popular: false,
    introOnly: true,
  },
  {
    id: "monthly",
    name: "Monthly",
    description: "Full access, billed monthly",
    price: 9.99,
    interval: "month" as const,
    priceId: STRIPE_CONFIG.prices.monthly,
    savings: null as string | null,
    features: [
      "Unlimited hadith access",
      "AI-powered explanations",
      "Learning paths",
      "Progress tracking",
      "Offline access",
    ],
    popular: false,
    introOnly: false,
  },
  {
    id: "annual",
    name: "Annual",
    description: "Best value for committed learners",
    price: 49.99,
    interval: "year" as const,
    priceId: STRIPE_CONFIG.prices.annual,
    savings: "Save 58%",
    features: [
      "Everything in Monthly",
      "Priority support",
      "Early access to new features",
    ],
    popular: true,
    introOnly: false,
  },
  {
    id: "lifetime",
    name: "Lifetime",
    description: "One-time payment, forever access",
    price: 99.99,
    interval: null,
    priceId: STRIPE_CONFIG.prices.lifetime,
    savings: null as string | null,
    features: [
      "Everything included forever",
      "All future features",
      "No recurring payments",
    ],
    popular: false,
    introOnly: false,
  },
];

export type PlanId = (typeof PLANS)[number]["id"];
