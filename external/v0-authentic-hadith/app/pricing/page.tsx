"use client";

import { BottomNavigation } from "@/components/home/bottom-navigation";
import { PLANS } from "@/lib/stripe/config";
import {
    Check,
    ChevronLeft,
    Crown,
    Loader2,
    Sparkles,
    Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function PricingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async (planId: string, priceId: string) => {
    if (!priceId) {
      setError("This plan is not yet available. Please try again later.");
      return;
    }

    setLoading(planId);
    setError(null);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId, planId }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          // Redirect to login if not authenticated
          router.push("/onboarding?redirect=/pricing");
          return;
        }
        throw new Error(data.error || "Failed to start checkout");
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(null);
    }
  };

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case "lifetime":
        return <Crown className="w-6 h-6" />;
      case "annual":
        return <Sparkles className="w-6 h-6" />;
      default:
        return <Zap className="w-6 h-6" />;
    }
  };

  return (
    <div className="min-h-screen marble-bg pb-20 md:pb-0">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[#e5e7eb] bg-[#F8F6F2]/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-[#F8F6F2] border border-[#e5e7eb] flex items-center justify-center hover:border-[#C5A059] transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-[#6b7280]" />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-[#1a1f36]">
              Upgrade to Premium
            </h1>
            <p className="text-sm text-muted-foreground">
              Unlock the full Authentic Hadith experience
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Premium Features Overview */}
        <div className="mb-8 p-6 gold-border rounded-xl premium-card">
          <h2 className="text-lg font-semibold text-[#1a1f36] mb-4 flex items-center gap-2">
            <Crown className="w-5 h-5 text-[#C5A059]" />
            Premium Features
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              "Unlimited AI-powered explanations",
              "Save unlimited hadiths",
              "Offline access to collections",
              "Ad-free experience",
              "Priority support",
              "Early access to new features",
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-[#10b981]" />
                <span className="text-[#374151]">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative gold-border rounded-xl p-5 premium-card ${
                plan.popular ? "ring-2 ring-[#C5A059] shadow-lg" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#C5A059] text-white text-xs font-medium rounded-full">
                  Most Popular
                </div>
              )}

              {plan.introOnly && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#10b981] text-white text-xs font-medium rounded-full">
                  New Members
                </div>
              )}

              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-lg gold-icon-bg flex items-center justify-center">
                  {getPlanIcon(plan.id)}
                </div>
                <div>
                  <h3 className="font-semibold text-[#1a1f36]">{plan.name}</h3>
                  {plan.savings && (
                    <span className="text-xs text-[#10b981] font-medium">
                      {plan.savings}
                    </span>
                  )}
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-4">
                {plan.description}
              </p>

              <div className="mb-4">
                <span className="text-3xl font-bold text-[#1a1f36]">
                  ${plan.price}
                </span>
                {plan.interval && (
                  <span className="text-muted-foreground">
                    /{plan.interval}
                  </span>
                )}
              </div>

              <ul className="space-y-2 mb-6">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 text-sm text-[#374151]"
                  >
                    <Check className="w-4 h-4 text-[#10b981] mt-0.5 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan.id, plan.priceId)}
                disabled={loading !== null}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                  plan.popular
                    ? "bg-[#C5A059] text-white hover:bg-[#B89048]"
                    : "bg-[#F8F6F2] border border-[#e5e7eb] text-[#1a1f36] hover:border-[#C5A059]"
                } disabled:opacity-50`}
              >
                {loading === plan.id ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>{plan.interval ? "Subscribe" : "Buy Now"}</>
                )}
              </button>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-12">
          <h2 className="text-lg font-semibold text-[#1a1f36] mb-4">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <div className="gold-border rounded-xl p-4 premium-card">
              <h3 className="font-medium text-[#1a1f36] mb-1">
                Can I cancel anytime?
              </h3>
              <p className="text-sm text-muted-foreground">
                Yes, you can cancel your subscription at any time. You'll
                continue to have access until the end of your billing period.
              </p>
            </div>
            <div className="gold-border rounded-xl p-4 premium-card">
              <h3 className="font-medium text-[#1a1f36] mb-1">
                What's the difference between Monthly and Lifetime?
              </h3>
              <p className="text-sm text-muted-foreground">
                Monthly is a recurring subscription billed each month. Lifetime
                is a one-time payment that gives you permanent access to all
                features, including future updates.
              </p>
            </div>
            <div className="gold-border rounded-xl p-4 premium-card">
              <h3 className="font-medium text-[#1a1f36] mb-1">
                Is my payment secure?
              </h3>
              <p className="text-sm text-muted-foreground">
                Absolutely. All payments are processed securely through Stripe,
                a PCI Level 1 certified payment processor.
              </p>
            </div>
          </div>
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
}
