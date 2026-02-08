"use client";

import { getCheckoutSession } from "@/app/actions/stripe";
import { CheckCircle, Loader2, Sparkles, XCircle } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

type SyncResult = {
  synced: boolean;
  plan?: string;
  isLifetime?: boolean;
  reason?: string;
};

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState<"syncing" | "success" | "error">(
    "syncing",
  );
  const [customerEmail, setCustomerEmail] = useState<string | null>(null);
  const [planName, setPlanName] = useState<string>("Premium");

  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      return;
    }

    async function syncAndVerify() {
      try {
        // Step 1: Sync subscription to Supabase (prevents "paid but locked" issue)
        const syncRes = await fetch(
          `/api/subscription/sync?session_id=${sessionId}`,
        );
        const syncData: SyncResult = await syncRes.json();

        if (syncData.synced) {
          // Set friendly plan name
          if (syncData.isLifetime) {
            setPlanName("Lifetime");
          } else if (syncData.plan === "premium_yearly") {
            setPlanName("Annual");
          } else {
            setPlanName("Premium");
          }
        }

        // Step 2: Verify session completed in Stripe
        const session = await getCheckoutSession(sessionId!);
        if (session.status === "complete") {
          setStatus("success");
          setCustomerEmail(session.customerEmail);
        } else {
          setStatus("error");
        }
      } catch (error) {
        console.error("Failed to sync/fetch session:", error);
        setStatus("error");
      }
    }

    syncAndVerify();
  }, [sessionId]);

  if (status === "syncing") {
    return (
      <div className="min-h-screen marble-bg flex items-center justify-center">
        <div className="text-center">
          <div className="relative mx-auto mb-4 w-16 h-16">
            <Loader2 className="w-16 h-16 animate-spin text-[#C5A059]" />
            <Sparkles className="w-6 h-6 text-[#1B5E43] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-lg font-medium text-[#1a1f36] mb-1">
            Unlocking Premium...
          </p>
          <p className="text-muted-foreground text-sm">
            Confirming your payment and activating your account
          </p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen marble-bg flex items-center justify-center px-4">
        <div className="max-w-md mx-auto text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-[#1a1f36] mb-2">
            Payment Issue
          </h1>
          <p className="text-muted-foreground mb-6">
            We couldn't confirm your payment. If you were charged, please
            contact support.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/pricing"
              className="px-6 py-3 rounded-lg border border-[#e5e7eb] text-[#1a1f36] hover:border-[#C5A059] transition-colors"
            >
              Try Again
            </Link>
            <Link
              href="/home"
              className="px-6 py-3 rounded-lg bg-[#1B5E43] text-white hover:bg-[#164a36] transition-colors"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen marble-bg flex items-center justify-center px-4">
      <div className="max-w-md mx-auto text-center">
        {/* Success Icon */}
        <div className="w-20 h-20 rounded-full bg-[#10b981]/10 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-[#10b981]" />
        </div>

        <h1 className="text-2xl font-serif font-bold text-[#1a1f36] mb-2">
          Payment Successful!
        </h1>

        <p className="text-muted-foreground mb-2">
          Thank you for upgrading to Authentic Hadith{" "}
          <strong>{planName}</strong>.
        </p>

        {customerEmail && (
          <p className="text-sm text-muted-foreground mb-6">
            A confirmation email has been sent to{" "}
            <strong>{customerEmail}</strong>
          </p>
        )}

        {/* Premium Features Unlocked */}
        <div className="bg-white rounded-xl border border-[#e5e7eb] p-6 mb-6 text-left">
          <h2 className="font-semibold text-[#1a1f36] mb-4">
            Your Premium Features:
          </h2>
          <ul className="space-y-3">
            {[
              "Unlimited AI-powered explanations",
              "Save unlimited hadiths",
              "Offline access to collections",
              "Ad-free experience",
              "Priority support",
            ].map((feature) => (
              <li key={feature} className="flex items-center gap-3 text-sm">
                <CheckCircle className="w-4 h-4 text-[#10b981] shrink-0" />
                <span className="text-[#374151]">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/home"
            className="px-6 py-3 rounded-lg bg-[#1B5E43] text-white hover:bg-[#164a36] transition-colors font-medium"
          >
            Start Exploring
          </Link>
          <Link
            href="/settings"
            className="px-6 py-3 rounded-lg border border-[#e5e7eb] text-[#1a1f36] hover:border-[#C5A059] transition-colors"
          >
            Manage Subscription
          </Link>
        </div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen marble-bg flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-[#C5A059] mx-auto mb-4" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
