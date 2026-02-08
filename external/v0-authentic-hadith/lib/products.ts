// Product catalog mapping internal IDs to real Stripe product IDs
// Stripe account: acct_1SxvyK2Nr0wloqqf

export type ProductId = "monthly_intro" | "monthly" | "annual" | "lifetime";

export interface Product {
  id: ProductId;
  stripeProductId: string;
  name: string;
  description: string;
  price: number;
  interval: "month" | "year" | null;
  mode: "subscription" | "payment";
  popular?: boolean;
  introOnly?: boolean;
  savings?: string;
  features: string[];
}

export const PRODUCTS: Record<ProductId, Product> = {
  monthly_intro: {
    id: "monthly_intro",
    stripeProductId: "prod_TwJihTwf0x4hmv",
    name: "Monthly (Intro)",
    description: "First-time members special",
    price: 4.99,
    interval: "month",
    mode: "subscription",
    introOnly: true,
    features: [
      "Unlimited hadith access",
      "AI-powered explanations",
      "Learning paths",
      "Progress tracking",
    ],
  },
  monthly: {
    id: "monthly",
    stripeProductId: "prod_TwJiYHi7QRpGqJ",
    name: "Monthly Premium",
    description: "Full access, billed monthly",
    price: 9.99,
    interval: "month",
    mode: "subscription",
    features: [
      "Unlimited hadith access",
      "AI-powered explanations",
      "Learning paths",
      "Progress tracking",
      "Offline access",
    ],
  },
  annual: {
    id: "annual",
    stripeProductId: "prod_TwJiyXNERmzQwW",
    name: "Annual Premium",
    description: "Best value for committed learners",
    price: 49.99,
    interval: "year",
    mode: "subscription",
    popular: true,
    savings: "Save 58%",
    features: [
      "Everything in Monthly",
      "Priority support",
      "Early access to new features",
    ],
  },
  lifetime: {
    id: "lifetime",
    stripeProductId: "prod_TwJiLLwEm4kwBJ",
    name: "Lifetime Access",
    description: "One-time payment, forever access",
    price: 99.99,
    interval: null,
    mode: "payment",
    features: [
      "Everything included forever",
      "All future features",
      "No recurring payments",
    ],
  },
};

// Get all products as an array (useful for iteration)
export const PRODUCTS_LIST = Object.values(PRODUCTS);

// Get product by Stripe product ID
export function getProductByStripeId(
  stripeProductId: string,
): Product | undefined {
  return PRODUCTS_LIST.find((p) => p.stripeProductId === stripeProductId);
}
