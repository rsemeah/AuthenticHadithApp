"use client";

import { createCheckoutSession } from "@/app/actions/stripe";
import type { ProductId } from "@/lib/products";
import {
    EmbeddedCheckout,
    EmbeddedCheckoutProvider,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Loader2 } from "lucide-react";
import { useCallback, useState } from "react";

// Initialize Stripe.js with public key
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
);

interface CheckoutProps {
  productId: ProductId;
  onClose?: () => void;
}

export function Checkout({ productId, onClose }: CheckoutProps) {
  const [error, setError] = useState<string | null>(null);

  const fetchClientSecret = useCallback(async () => {
    try {
      const { clientSecret } = await createCheckoutSession(productId);
      if (!clientSecret) {
        throw new Error("Failed to create checkout session");
      }
      return clientSecret;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Checkout failed";
      setError(message);
      throw err;
    }
  }, [productId]);

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <div id="checkout" className="min-h-[400px]">
      <EmbeddedCheckoutProvider
        stripe={stripePromise}
        options={{ fetchClientSecret }}
      >
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}

// Loading state component for checkout
export function CheckoutLoading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="w-8 h-8 animate-spin text-[#C5A059]" />
    </div>
  );
}
