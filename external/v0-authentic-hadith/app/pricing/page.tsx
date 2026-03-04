"use client"

import React from "react"
import { useState, Suspense } from "react"
import { useRouter } from "next/navigation"
import {
  ChevronLeft,
  Check,
  Star,
  Crown,
  Zap,
  Infinity,
  X,
  Loader2,
  Shield,
  BookOpen,
  MessageCircle,
} from "lucide-react"
import { BottomNavigation } from "@/components/home/bottom-navigation"
import { PRODUCTS } from "@/lib/products"
import type { Product } from "@/lib/products"
import dynamic from "next/dynamic"
import { selectFreePlan } from "@/app/actions/stripe"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

const Checkout = dynamic(() => import("@/components/checkout"), { ssr: false })

function PriceDisplay({ product }: { product: Product }) {
  if (product.interval === "year") {
    const monthly = (product.priceInCents / 100 / 12).toFixed(2)
    return (
      <div className="text-right shrink-0 ml-4">
        <div className="text-2xl font-bold text-[#1a1f36]">${(product.priceInCents / 100).toFixed(2)}</div>
        <div className="text-xs text-[#C5A059] font-medium">${monthly}/mo</div>
        <div className="text-xs text-[#6b7280]">billed yearly</div>
      </div>
    )
  }
  if (product.interval === "month") {
    return (
      <div className="text-right shrink-0 ml-4">
        <div className="text-2xl font-bold text-[#1a1f36]">${(product.priceInCents / 100).toFixed(2)}</div>
        <div className="text-xs text-[#6b7280]">per month</div>
      </div>
    )
  }
  return (
    <div className="text-right shrink-0 ml-4">
      <div className="text-2xl font-bold text-[#1a1f36]">${(product.priceInCents / 100).toFixed(2)}</div>
      <div className="text-xs text-[#6b7280]">one-time</div>
    </div>
  )
}

const planIcons: Record<string, React.ReactNode> = {
  "monthly-intro": <Zap className="w-5 h-5 text-[#C5A059]" />,
  "monthly-premium": <Star className="w-5 h-5 text-[#C5A059]" />,
  "annual-premium": <Crown className="w-5 h-5 text-[#C5A059]" />,
  "lifetime-access": <Infinity className="w-5 h-5 text-[#C5A059]" />,
}

// Soft upsell modal shown when user picks the free plan
function FreeUpsellModal({
  onUpgrade,
  onContinueFree,
  loading,
}: {
  onUpgrade: () => void
  onContinueFree: () => void
  loading: boolean
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#C5A059] to-[#E8C77D] p-6 text-white text-center">
          <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-white/20 flex items-center justify-center">
            <Star className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-xl font-bold">Before You Continue...</h2>
          <p className="text-sm text-white/90 mt-1">Here's what you'd unlock with Premium</p>
        </div>

        {/* What they're missing */}
        <div className="p-6 space-y-3">
          {[
            { icon: <MessageCircle className="w-4 h-4 text-[#C5A059]" />, text: "Unlimited AI-powered explanations & assistant" },
            { icon: <BookOpen className="w-4 h-4 text-[#C5A059]" />, text: "All learning paths & progress tracking" },
            { icon: <Shield className="w-4 h-4 text-[#C5A059]" />, text: "Advanced hadith search & semantic search" },
            { icon: <Star className="w-4 h-4 text-[#C5A059]" />, text: "Priority support & early feature access" },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-[#F8F6F2] flex items-center justify-center shrink-0">
                {icon}
              </div>
              <span className="text-sm text-[#4a5568]">{text}</span>
            </div>
          ))}
        </div>

        <p className="px-6 text-xs text-center text-[#6b7280]">
          Plans start at just <strong className="text-[#C5A059]">$4.99/month</strong> — less than a cup of coffee.
        </p>

        {/* Actions */}
        <div className="p-6 pt-4 space-y-3">
          <button
            onClick={onUpgrade}
            className="w-full py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#C5A059] to-[#E8C77D] text-white hover:opacity-90 shadow-md transition-all"
          >
            See Premium Plans
          </button>
          <button
            onClick={onContinueFree}
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-sm border border-[#e5e7eb] text-[#6b7280] hover:border-[#C5A059] hover:text-[#C5A059] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Setting up your account...
              </>
            ) : (
              "Continue with Free Plan"
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

function PricingContent() {
  const router = useRouter()
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const [showFreeUpsell, setShowFreeUpsell] = useState(false)
  const [selectingFree, setSelectingFree] = useState(false)

  const handleSelectPlan = async (productId: string) => {
    // Check authentication before proceeding
    const supabase = getSupabaseBrowserClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push(`/login?next=/pricing`)
      return
    }

    setCheckoutError(null)
    setSelectedProduct(productId)
  }

  const handleSelectFree = async () => {
    // Check authentication
    const supabase = getSupabaseBrowserClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push(`/login?next=/pricing`)
      return
    }

    // Show the upsell modal instead of going straight to free
    setShowFreeUpsell(true)
  }

  const handleConfirmFree = async () => {
    setSelectingFree(true)
    try {
      await selectFreePlan()
      document.cookie = "qbos_plan_selected=1; path=/; max-age=31536000; SameSite=Lax"
      router.push("/home")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong. Please try again."
      setCheckoutError(message)
      setShowFreeUpsell(false)
      setSelectingFree(false)
    }
  }

  if (selectedProduct) {
    return (
      <div className="min-h-screen marble-bg pb-20 md:pb-0">
        <header className="sticky top-0 z-40 border-b border-[#e5e7eb] bg-[#F8F6F2]/95 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
            <button
              onClick={() => {
                setSelectedProduct(null)
                setCheckoutError(null)
              }}
              className="w-10 h-10 rounded-full bg-[#F8F6F2] border border-[#e5e7eb] flex items-center justify-center hover:border-[#C5A059] transition-colors"
            >
              <X className="w-5 h-5 text-[#6b7280]" />
            </button>
            <h1 className="text-lg font-semibold text-[#1a1f36]">Complete Payment</h1>
          </div>
        </header>
        <main className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
          {checkoutError ? (
            <div className="text-center py-12">
              <p className="text-destructive mb-4">{checkoutError}</p>
              <button
                onClick={() => {
                  setCheckoutError(null)
                  setSelectedProduct(null)
                }}
                className="px-6 py-2 gold-button rounded-lg text-sm"
              >
                Back to Plans
              </button>
            </div>
          ) : (
            <Checkout productId={selectedProduct} onError={(msg) => setCheckoutError(msg)} />
          )}
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen marble-bg pb-20 md:pb-0">
      {/* Free plan upsell modal */}
      {showFreeUpsell && (
        <FreeUpsellModal
          onUpgrade={() => setShowFreeUpsell(false)}
          onContinueFree={handleConfirmFree}
          loading={selectingFree}
        />
      )}

      <header className="sticky top-0 z-40 border-b border-[#e5e7eb] bg-[#F8F6F2]/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-[#F8F6F2] border border-[#e5e7eb] flex items-center justify-center hover:border-[#C5A059] transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-[#6b7280]" />
          </button>
          <h1 className="text-lg font-semibold text-[#1a1f36]">Choose Your Plan</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#C5A059] to-[#E8C77D] flex items-center justify-center">
            <Star className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-[#1a1f36] text-balance">Unlock Authentic Hadith Premium</h2>
          <p className="text-[#6b7280] mt-2 max-w-md mx-auto text-pretty">
            Get full access to AI explanations, advanced search, learning paths, and more.
          </p>
        </div>

        {checkoutError && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm text-center">
            {checkoutError}
          </div>
        )}

        <div className="space-y-4">
          {PRODUCTS.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-xl p-5 transition-all ${
                plan.highlighted
                  ? "gold-border premium-card ring-2 ring-[#C5A059]/30"
                  : "border border-[#e5e7eb] bg-white"
              }`}
            >
              {plan.badge && (
                <div
                  className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-white text-xs font-bold ${
                    plan.highlighted
                      ? "bg-gradient-to-r from-[#C5A059] to-[#E8C77D]"
                      : plan.id === "lifetime-access"
                        ? "bg-gradient-to-r from-[#1B5E43] to-[#2D7A5B]"
                        : "bg-[#6b7280]"
                  }`}
                >
                  {plan.badge}
                </div>
              )}

              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#F8F6F2] border border-[#e5e7eb] flex items-center justify-center shrink-0 mt-0.5">
                    {planIcons[plan.id]}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[#1a1f36]">{plan.name}</h3>
                    <p className="text-sm text-[#6b7280] mt-0.5 max-w-xs">{plan.description}</p>
                  </div>
                </div>
                <PriceDisplay product={plan} />
              </div>

              {plan.features && (
                <ul className="space-y-2 mb-5">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-[#4a5568]">
                      <Check className="w-4 h-4 text-[#1B5E43] shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              )}

              <button
                onClick={() => handleSelectPlan(plan.id)}
                className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${
                  plan.highlighted
                    ? "bg-gradient-to-r from-[#C5A059] to-[#E8C77D] text-white hover:opacity-90 shadow-md"
                    : plan.id === "lifetime-access"
                      ? "bg-gradient-to-r from-[#1B5E43] to-[#2D7A5B] text-white hover:opacity-90 shadow-md"
                      : "bg-[#F8F6F2] border border-[#e5e7eb] text-[#1a1f36] hover:border-[#C5A059] hover:text-[#C5A059]"
                }`}
              >
                {plan.mode === "payment" ? "Buy Lifetime Access" : "Subscribe Now"}
              </button>
            </div>
          ))}

          {/* Free Tier Card */}
          <div className="rounded-xl border border-dashed border-[#e5e7eb] p-5 bg-white/50">
            <h3 className="text-sm font-semibold text-[#6b7280] uppercase tracking-wider mb-3">
              Free Plan
            </h3>
            <ul className="space-y-2 mb-5">
              {[
                "Browse all 8 hadith collections",
                "Basic search",
                "Save & bookmark hadiths (up to 10)",
                "AI assistant (limited)",
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm text-[#6b7280]">
                  <Check className="w-4 h-4 text-[#6b7280] shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
            <button
              onClick={handleSelectFree}
              className="w-full py-3 rounded-xl font-semibold text-sm border border-[#e5e7eb] text-[#6b7280] hover:border-[#C5A059] hover:text-[#C5A059] transition-all"
            >
              Continue with Free Plan
            </button>
          </div>
        </div>
      </main>

      <BottomNavigation />
    </div>
  )
}

export default function PricingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen marble-bg flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#C5A059] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <PricingContent />
    </Suspense>
  )
}
