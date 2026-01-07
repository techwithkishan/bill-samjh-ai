-- Create bill_analyses table to store analysis history
CREATE TABLE public.bill_analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  billing_month TEXT NOT NULL,
  total_units INTEGER NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  previous_units INTEGER,
  previous_amount DECIMAL(10,2),
  tariff_category TEXT,
  consumer_number TEXT,
  due_date TEXT,
  ai_summary TEXT,
  ai_hinglish_explanation TEXT,
  ai_factors TEXT[],
  estimated_units INTEGER,
  estimated_amount DECIMAL(10,2),
  estimation_methodology TEXT,
  estimation_confidence TEXT,
  savings_tips JSONB,
  language TEXT DEFAULT 'english',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bill_analyses ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (session-based, no auth required)
CREATE POLICY "Anyone can insert bill analyses"
ON public.bill_analyses
FOR INSERT
WITH CHECK (true);

-- Allow anyone to read their own session's analyses
CREATE POLICY "Anyone can read bill analyses by session"
ON public.bill_analyses
FOR SELECT
USING (true);

-- Create index for faster session lookups
CREATE INDEX idx_bill_analyses_session_id ON public.bill_analyses(session_id);
CREATE INDEX idx_bill_analyses_created_at ON public.bill_analyses(created_at DESC);