/*
  # Create Sponsor Invitation Codes System

  1. New Tables
    - `sponsor_invitation_codes`
      - `id` (uuid, primary key)
      - `code` (text, unique) - The sponsor code (e.g., SPN-002349)
      - `sponsor_user_id` (uuid, foreign key to auth.users) - The sponsor creating the code
      - `sponsor_name` (text) - Sponsor's name
      - `sponsor_email` (text) - Sponsor's email
      - `sponsor_phone` (text) - Sponsor's phone
      - `plan_id` (uuid, foreign key to subscription_plans) - The plan being offered
      - `max_uses` (integer) - Maximum number of times this code can be used
      - `used_count` (integer) - Number of times code has been used
      - `expires_at` (timestamptz) - When the code expires
      - `status` (text) - "active", "expired", "revoked"
      - `relationship` (text) - Relationship to sponsored user (e.g., "Son", "Daughter")
      - `billing_cycle` (text) - "monthly" or "yearly"
      - `metadata` (jsonb) - Additional information
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on sponsor_invitation_codes table
    - Sponsors can create and manage their own codes
    - Anyone authenticated can read active codes to validate them
    - Only sponsors can view their own codes

  3. Indexes
    - Index on code for quick lookups
    - Index on sponsor_user_id for sponsor's code management
    - Index on status for filtering active codes
*/

-- Create sponsor_invitation_codes table
CREATE TABLE IF NOT EXISTS sponsor_invitation_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  sponsor_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sponsor_name text NOT NULL,
  sponsor_email text NOT NULL,
  sponsor_phone text NOT NULL DEFAULT '',
  plan_id uuid NOT NULL REFERENCES subscription_plans(id) ON DELETE CASCADE,
  max_uses integer NOT NULL DEFAULT 1,
  used_count integer NOT NULL DEFAULT 0,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '30 days'),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked')),
  relationship text NOT NULL DEFAULT 'Family',
  billing_cycle text NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_sponsor_codes_code ON sponsor_invitation_codes(code);
CREATE INDEX IF NOT EXISTS idx_sponsor_codes_sponsor_id ON sponsor_invitation_codes(sponsor_user_id);
CREATE INDEX IF NOT EXISTS idx_sponsor_codes_status ON sponsor_invitation_codes(status);

-- Enable RLS
ALTER TABLE sponsor_invitation_codes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Sponsors can view own invitation codes"
  ON sponsor_invitation_codes FOR SELECT
  TO authenticated
  USING (auth.uid() = sponsor_user_id);

CREATE POLICY "Sponsors can create invitation codes"
  ON sponsor_invitation_codes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sponsor_user_id);

CREATE POLICY "Sponsors can update own invitation codes"
  ON sponsor_invitation_codes FOR UPDATE
  TO authenticated
  USING (auth.uid() = sponsor_user_id)
  WITH CHECK (auth.uid() = sponsor_user_id);

CREATE POLICY "Authenticated users can validate codes"
  ON sponsor_invitation_codes FOR SELECT
  TO authenticated
  USING (status = 'active' AND expires_at > now() AND used_count < max_uses);

-- Function to generate unique sponsor code
CREATE OR REPLACE FUNCTION generate_sponsor_code()
RETURNS text AS $$
DECLARE
  new_code text;
  code_exists boolean;
BEGIN
  LOOP
    -- Generate code in format SPN-XXXXXX (6 random digits)
    new_code := 'SPN-' || LPAD(FLOOR(RANDOM() * 1000000)::text, 6, '0');
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM sponsor_invitation_codes WHERE code = new_code) INTO code_exists;
    
    -- Exit loop if code is unique
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  RETURN new_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
