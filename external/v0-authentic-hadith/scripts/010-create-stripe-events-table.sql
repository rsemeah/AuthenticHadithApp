-- Stripe events deduplication table
-- Prevents processing the same webhook event twice (Stripe retries on transient failures)

CREATE TABLE IF NOT EXISTS public.stripe_events (
  event_id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  payload JSONB,
  received_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- Index for cleanup queries and ordering
CREATE INDEX IF NOT EXISTS idx_stripe_events_received_at 
ON public.stripe_events(received_at);

-- Partial index for quick lookup of unprocessed events
CREATE INDEX IF NOT EXISTS idx_stripe_events_unprocessed 
ON public.stripe_events(received_at) WHERE processed_at IS NULL;

-- RLS enabled - service_role key bypasses RLS for webhook writes
ALTER TABLE public.stripe_events ENABLE ROW LEVEL SECURITY;

-- No client-facing policies needed - only service role writes via webhook
