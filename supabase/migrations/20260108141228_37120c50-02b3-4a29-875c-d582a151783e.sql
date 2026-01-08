-- Add new columns to bill_analyses for comprehensive bill comparison
-- These fields support multiple bill types and detailed charge breakdown

ALTER TABLE public.bill_analyses 
ADD COLUMN IF NOT EXISTS bill_type text DEFAULT 'electricity',
ADD COLUMN IF NOT EXISTS taxes_gst numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS fixed_charges numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS additional_charges numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS due_amount numeric DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.bill_analyses.bill_type IS 'Type of bill: electricity, water, mobile, internet, gas';
COMMENT ON COLUMN public.bill_analyses.taxes_gst IS 'Tax/GST amount on the bill';
COMMENT ON COLUMN public.bill_analyses.fixed_charges IS 'Fixed monthly charges';
COMMENT ON COLUMN public.bill_analyses.additional_charges IS 'Any additional/miscellaneous charges';
COMMENT ON COLUMN public.bill_analyses.due_amount IS 'Total due amount including arrears';