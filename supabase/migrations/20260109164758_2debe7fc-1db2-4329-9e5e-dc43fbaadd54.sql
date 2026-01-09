-- Add user_id column to bill_analyses table
ALTER TABLE public.bill_analyses 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for faster queries
CREATE INDEX idx_bill_analyses_user_id ON public.bill_analyses(user_id);

-- Drop old session-based RLS policies
DROP POLICY IF EXISTS "Users can delete their own session data" ON public.bill_analyses;
DROP POLICY IF EXISTS "Users can only insert their own session data" ON public.bill_analyses;
DROP POLICY IF EXISTS "Users can only read their own session data" ON public.bill_analyses;

-- Create new auth-based RLS policies using auth.uid()
CREATE POLICY "Users can read their own bills"
ON public.bill_analyses
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bills"
ON public.bill_analyses
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bills"
ON public.bill_analyses
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bills"
ON public.bill_analyses
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);