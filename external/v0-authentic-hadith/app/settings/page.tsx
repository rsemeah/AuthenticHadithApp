"use client";

import { BottomNavigation } from "@/components/home/bottom-navigation";
import { useSubscription } from "@/lib/subscription/context";
import {
    Bell,
    Check,
    ChevronLeft,
    CreditCard,
    Crown,
    Globe,
    HelpCircle,
    Loader2,
    Moon,
    Shield,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

const settingsItems = [
  {
    id: "notifications",
    icon: Bell,
    label: "Notifications",
    description: "Manage push notifications",
  },
  {
    id: "appearance",
    icon: Moon,
    label: "Appearance",
    description: "Dark mode and display settings",
  },
  {
    id: "language",
    icon: Globe,
    label: "Language",
    description: "Change app language",
  },
  {
    id: "privacy",
    icon: Shield,
    label: "Privacy & Security",
    description: "Manage your data",
  },
  {
    id: "help",
    icon: HelpCircle,
    label: "Help & Support",
    description: "Get help and contact us",
  },
];

function SettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { subscription, isPremium, isLoading } = useSubscription();
  const [portalLoading, setPortalLoading] = useState(false);
  const success = searchParams.get("success");

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    try {
      const response = await fetch("/api/portal", {
        method: "POST",
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Failed to open portal:", error);
    } finally {
      setPortalLoading(false);
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
          <h1 className="text-lg font-semibold text-[#1a1f36]">Settings</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Success message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm flex items-center gap-2">
            <Check className="w-5 h-5" />
            Your subscription has been activated successfully!
          </div>
        )}

        {/* Subscription Section */}
        <div className="mb-6">
          <h2 className="text-sm font-medium text-[#6b7280] uppercase tracking-wide mb-3">
            Subscription
          </h2>
          {isLoading ? (
            <div className="gold-border rounded-xl p-4 premium-card flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-[#C5A059]" />
            </div>
          ) : isPremium ? (
            <div className="gold-border rounded-xl p-4 premium-card">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#C5A059]/20 flex items-center justify-center shrink-0">
                  <Crown className="w-5 h-5 text-[#C5A059]" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-[#1a1f36] flex items-center gap-2">
                    Premium Active
                    <span className="text-xs px-2 py-0.5 bg-[#10b981]/10 text-[#10b981] rounded-full">
                      {subscription?.plan_id}
                    </span>
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {subscription?.plan_id === "lifetime"
                      ? "Lifetime access - no expiration"
                      : subscription?.current_period_end
                        ? `Renews ${new Date(subscription.current_period_end).toLocaleDateString()}`
                        : "Active subscription"}
                  </p>
                </div>
              </div>
              <button
                onClick={handleManageSubscription}
                disabled={portalLoading}
                className="mt-4 w-full py-2 px-4 rounded-lg border border-[#e5e7eb] text-sm font-medium text-[#374151] hover:border-[#C5A059] transition-colors flex items-center justify-center gap-2"
              >
                {portalLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CreditCard className="w-4 h-4" />
                )}
                Manage Subscription
              </button>
            </div>
          ) : (
            <button
              onClick={() => router.push("/pricing")}
              className="w-full gold-border rounded-xl p-4 premium-card flex items-center gap-4 hover:-translate-y-0.5 transition-transform text-left"
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#C5A059] to-[#B89048] flex items-center justify-center shrink-0">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-[#1a1f36]">
                  Upgrade to Premium
                </h3>
                <p className="text-sm text-muted-foreground">
                  Unlock AI explanations, unlimited saves & more
                </p>
              </div>
            </button>
          )}
        </div>

        {/* Other Settings */}
        <div>
          <h2 className="text-sm font-medium text-[#6b7280] uppercase tracking-wide mb-3">
            General
          </h2>
          <div className="space-y-3">
            {settingsItems.map((item) => (
              <button
                key={item.id}
                className="w-full gold-border rounded-xl p-4 premium-card flex items-center gap-4 hover:-translate-y-0.5 transition-transform text-left"
              >
                <div className="w-10 h-10 rounded-lg gold-icon-bg flex items-center justify-center shrink-0">
                  <item.icon className="w-5 h-5 text-[#C5A059]" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-[#1a1f36]">{item.label}</h3>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Authentic Hadith v1.0.0</p>
          <p className="mt-1">Made with care for the Muslim community</p>
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen marble-bg flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-[#C5A059]" />
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SettingsContent />
    </Suspense>
  );
}
