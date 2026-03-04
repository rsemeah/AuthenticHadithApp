"use client"

import { useCallback } from "react"
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import { startCheckoutSession } from "@/app/actions/stripe"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function Checkout({
  productId,
  onError,
}: {
  productId: string
  onError?: (message: string) => void
}) {
  const fetchClientSecret = useCallback(async () => {
    try {
      const secret = await startCheckoutSession(productId)
      if (!secret) throw new Error("No client secret returned from Stripe")
      return secret
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to start checkout session"
      onError?.(message)
      throw err
    }
  }, [productId, onError])

  return (
    <div id="checkout">
      <EmbeddedCheckoutProvider stripe={stripePromise} options={{ fetchClientSecret }}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  )
}
