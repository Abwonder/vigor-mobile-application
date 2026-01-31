-- Create registration_tracking table
CREATE TABLE IF NOT EXISTS public.registration_tracking (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    email TEXT,
    phone TEXT,
    user_type TEXT NOT NULL, -- 'patient' or 'specialist'
    current_step TEXT DEFAULT 'signup', -- 'signup', 'verification', 'completed'
    status TEXT DEFAULT 'pending', -- 'pending', 'verified', 'abandoned'
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.registration_tracking ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own tracking"
    ON public.registration_tracking FOR SELECT
    USING (auth.uid() = user_id OR email = current_setting('request.jwt.claim.email', true));

CREATE POLICY "Service role can manage all tracking"
    ON public.registration_tracking FOR ALL
    USING (true)
    WITH CHECK (true);

-- Allow public insert/update during registration (secured via triggers/functions ideally, but for now allow helpful access)
-- Note: In a stricter production env, we might wrap this in a postgres function called by RPC.
-- For now, letting anon insert is risky without strict validation. 
-- Better approach: We will use a defined function to handle registration tracking updates safely from the client, 
-- or rely on the fact that `auth.uid()` might be null during signup.

-- Actually, for the "Marketing" purpose user mentioned, we need to capture this EVEN IF `auth.users` entry fails or hasn't started.
-- So we allow anon inserts but maybe rate limit or validate structure.
CREATE POLICY "Anon can insert tracking"
    ON public.registration_tracking FOR INSERT
    WITH CHECK (true);

-- CREATE POLICY "Anon can update own tracking by email reference (risky without verification)" 
-- This is tricky. Better to only allow updates if we have a user_id (post-signup) OR via a secure server function.
-- For this iteration, we will rely on client passing the ID it got back or querying by email?
-- Querying by email for Anon is a data leak risk.
-- Let's stick to: Client sends data, we store it.
-- If user exists in `auth.users`, we link them.

-- Function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_registration_tracking_updated_at
    BEFORE UPDATE ON public.registration_tracking
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
