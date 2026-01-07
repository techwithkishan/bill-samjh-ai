-- Drop existing permissive policies
DROP POLICY IF EXISTS "Anyone can insert bill analyses" ON public.bill_analyses;
DROP POLICY IF EXISTS "Anyone can read bill analyses by session" ON public.bill_analyses;

-- Create secure RLS policies that check session_id from request headers
-- Users must pass their session_id as a header to access their data

-- Policy for SELECT: Only read own session's data
CREATE POLICY "Users can only read their own session data"
ON public.bill_analyses
FOR SELECT
USING (
  session_id = coalesce(
    current_setting('request.headers', true)::json->>'x-session-id',
    ''
  )
);

-- Policy for INSERT: Only insert with matching session_id header
CREATE POLICY "Users can only insert their own session data"
ON public.bill_analyses
FOR INSERT
WITH CHECK (
  session_id = coalesce(
    current_setting('request.headers', true)::json->>'x-session-id',
    ''
  )
);