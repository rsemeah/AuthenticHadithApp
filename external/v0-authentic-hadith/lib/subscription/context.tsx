"use client";

import { createClient } from "@/lib/supabase/client";
import { AuthChangeEvent, Session, User } from "@supabase/supabase-js";
import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from "react";

export type SubscriptionPlan =
  | "free"
  | "monthly"
  | "monthly_intro"
  | "annual"
  | "lifetime";
export type SubscriptionStatus =
  | "none"
  | "active"
  | "canceled"
  | "past_due"
  | "unpaid"
  | "trialing";

interface Subscription {
  plan_id: SubscriptionPlan;
  status: SubscriptionStatus;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
}

interface SubscriptionContextType {
  user: User | null;
  subscription: Subscription | null;
  isPremium: boolean;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType>({
  user: null,
  subscription: null,
  isPremium: false,
  isLoading: true,
  refresh: async () => {},
});

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createClient();

  const fetchSubscription = async (userId: string) => {
    const { data } = await supabase
      .from("subscriptions")
      .select("plan_id, status, current_period_end, cancel_at_period_end")
      .eq("user_id", userId)
      .single();

    if (data) {
      setSubscription(data as Subscription);
    } else {
      setSubscription(null);
    }
  };

  const refresh = async () => {
    if (user) {
      await fetchSubscription(user.id);
    }
  };

  useEffect(() => {
    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        setUser(session.user);
        await fetchSubscription(session.user.id);
      }
      setIsLoading(false);
    };

    init();

    const {
      data: { subscription: authSubscription },
    } = supabase.auth.onAuthStateChange(
      async (_event: AuthChangeEvent, session: Session | null) => {
        if (session?.user) {
          setUser(session.user);
          await fetchSubscription(session.user.id);
        } else {
          setUser(null);
          setSubscription(null);
        }
      },
    );

    return () => {
      authSubscription.unsubscribe();
    };
  }, []);

  const isPremium =
    subscription?.status === "active" &&
    (subscription.plan_id === "lifetime" ||
      !subscription.current_period_end ||
      new Date(subscription.current_period_end) > new Date());

  return (
    <SubscriptionContext.Provider
      value={{ user, subscription, isPremium, isLoading, refresh }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error("useSubscription must be used within SubscriptionProvider");
  }
  return context;
}

// Helper hook for checking feature access
export function useFeatureAccess() {
  const { isPremium, isLoading } = useSubscription();

  return {
    isLoading,
    canAccessAI: isPremium,
    canSaveUnlimited: isPremium,
    canAccessOffline: isPremium,
    isAdFree: isPremium,
  };
}
