-- Add Stripe customer ID to existing profiles table (created by 001-create-profiles-table.sql)
-- Note: profiles table uses user_id column as FK to auth.users, not id = auth.users.id
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id 
ON public.profiles(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;

-- Create subscriptions table for tracking user subscriptions
-- Schema aligned with handoff specification
CREATE TABLE IF NOT EXISTS public.subscriptions (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT, -- NULL for lifetime (one-time) purchases
  plan TEXT NOT NULL DEFAULT 'free', -- 'free', 'premium_monthly', 'premium_yearly', 'lifetime'
  status TEXT NOT NULL DEFAULT 'inactive', -- 'active', 'canceled', 'past_due', 'unpaid', 'inactive'
  current_period_start TIMESTAMP WITH TIME ZONE, -- When current billing period started
  current_period_end TIMESTAMP WITH TIME ZONE, -- NULL for lifetime
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  is_lifetime BOOLEAN DEFAULT FALSE, -- TRUE for lifetime purchases (never downgrade)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own subscription
CREATE POLICY "Users can read own subscription" ON public.subscriptions
  FOR SELECT USING ((SELECT auth.uid()) = user_id);

-- No INSERT/UPDATE/DELETE policies for authenticated users
-- Only service role (webhook) can write to this table

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id 
ON public.subscriptions(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id 
ON public.subscriptions(stripe_subscription_id) WHERE stripe_subscription_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan ON public.subscriptions(plan);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_subscriptions_updated_at();

-- View for easy subscription status checking
CREATE OR REPLACE VIEW public.user_subscription_status AS
SELECT 
  u.id as user_id,
  u.email,
  COALESCE(s.plan, 'free') as plan,
  COALESCE(s.status, 'inactive') as status,
  s.current_period_end,
  s.cancel_at_period_end,
  COALESCE(s.is_lifetime, false) as is_lifetime,
  CASE 
    WHEN s.is_lifetime = true AND s.status = 'active' THEN true
    WHEN s.status = 'active' AND (s.current_period_end IS NULL OR s.current_period_end > NOW()) THEN true
    ELSE false
  END as is_premium
FROM auth.users u
LEFT JOIN public.subscriptions s ON u.id = s.user_id;

