-- Add DELETE policy for bill_analyses so users can delete their own bills
CREATE POLICY "Users can delete their own session data" 
ON public.bill_analyses 
FOR DELETE 
USING (session_id = COALESCE(((current_setting('request.headers'::text, true))::json ->> 'x-session-id'::text), ''::text));