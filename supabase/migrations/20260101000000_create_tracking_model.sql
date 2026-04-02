-- Tracking Model table for AA financial dashboard
-- Maps to the MonthlyEntry shape used in the React app

CREATE TABLE IF NOT EXISTS public.tracking_model (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  month text NOT NULL,            -- "2025-11" format (YYYY-MM)
  mrr numeric NOT NULL DEFAULT 0, -- Monthly Recurring Revenue (ZAR)
  costs numeric NOT NULL DEFAULT 0,
  draw numeric NOT NULL DEFAULT 0,  -- Owner draw
  trust_percent numeric NOT NULL DEFAULT 30,
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Row-level security: each user sees only their own rows
ALTER TABLE public.tracking_model ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own tracking rows"
  ON public.tracking_model
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Index for ordered month queries
CREATE INDEX IF NOT EXISTS tracking_model_month_idx ON public.tracking_model (month ASC);
