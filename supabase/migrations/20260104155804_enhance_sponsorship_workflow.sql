/*
  # Enhance Sponsorship Workflow
  
  This migration enhances the existing sponsorship system to support:
  - Sponsors managing multiple patients
  - Patients requesting sponsors by entering sponsor code
  - Sponsors accepting/declining requests
  - Multiple sponsors per patient (only one paying at a time)
  - Sponsored subscription tracking
  
  ## Changes Made
  
  1. Updates to Existing Tables
    - Add missing columns to sponsors table
    - Add columns to track active/paying sponsor
    - Add sponsored subscriptions tracking
  
  2. New Tables
    - `sponsored_subscriptions` - Track which sponsor paid for subscriptions
  
  3. New Functions & Triggers
    - Function to handle sponsorship request acceptance
    - Function to track sponsor payment status
  
  ## Security
    - All tables have RLS enabled
    - Proper policies for sponsors and patients
*/

-- Add total_patients and active_patients columns to sponsors table if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'sponsors' AND column_name = 'total_patients'
  ) THEN
    ALTER TABLE sponsors ADD COLUMN total_patients integer DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'sponsors' AND column_name = 'active_patients'
  ) THEN
    ALTER TABLE sponsors ADD COLUMN active_patients integer DEFAULT 0;
  END IF;
END $$;

-- Add is_paying column to sponsorships table if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'sponsorships' AND column_name = 'is_paying'
  ) THEN
    ALTER TABLE sponsorships ADD COLUMN is_paying boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'sponsorships' AND column_name = 'patient_name'
  ) THEN
    ALTER TABLE sponsorships ADD COLUMN patient_name text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'sponsorships' AND column_name = 'patient_email'
  ) THEN
    ALTER TABLE sponsorships ADD COLUMN patient_email text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'sponsorships' AND column_name = 'relationship_type'
  ) THEN
    ALTER TABLE sponsorships ADD COLUMN relationship_type text DEFAULT 'Other';
  END IF;
END $$;

-- Add updated_at to sponsorship_requests if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'sponsorship_requests' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE sponsorship_requests ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Create sponsored_subscriptions table to track payments
CREATE TABLE IF NOT EXISTS sponsored_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid NOT NULL REFERENCES user_subscriptions(id) ON DELETE CASCADE,
  sponsorship_id uuid NOT NULL REFERENCES sponsorships(id) ON DELETE CASCADE,
  sponsor_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES subscription_plans(id),
  payment_method text NOT NULL,
  amount_paid decimal(10,2) NOT NULL,
  billing_cycle text NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly')),
  paid_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_sponsored_subs_sponsor ON sponsored_subscriptions(sponsor_user_id);
CREATE INDEX IF NOT EXISTS idx_sponsored_subs_patient ON sponsored_subscriptions(patient_user_id);
CREATE INDEX IF NOT EXISTS idx_sponsored_subs_active ON sponsored_subscriptions(is_active);
CREATE INDEX IF NOT EXISTS idx_sponsored_subs_subscription ON sponsored_subscriptions(subscription_id);

-- Enable RLS on sponsored_subscriptions
ALTER TABLE sponsored_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sponsored_subscriptions
CREATE POLICY "Sponsors can view subscriptions they paid for"
  ON sponsored_subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = sponsor_user_id);

CREATE POLICY "Patients can view their sponsored subscriptions"
  ON sponsored_subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = patient_user_id);

CREATE POLICY "Sponsors can create sponsored subscriptions"
  ON sponsored_subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sponsor_user_id);

-- Function to handle accepted sponsorship requests
CREATE OR REPLACE FUNCTION handle_sponsorship_request_acceptance_v2()
RETURNS TRIGGER AS $$
BEGIN
  -- When a request is accepted, update or create the sponsorship relationship
  IF NEW.status = 'accepted' AND OLD.status = 'pending' THEN
    -- Update existing sponsorship or keep it as is
    UPDATE sponsorships
    SET 
      status = 'active',
      updated_at = now()
    WHERE sponsor_id = NEW.sponsor_user_id 
      AND patient_id = NEW.patient_user_id;
    
    -- If no existing sponsorship was updated, the original trigger already created it
    
    -- Update sponsor total patients count
    UPDATE sponsors
    SET 
      total_patients = total_patients + 1,
      active_patients = active_patients + 1,
      updated_at = now()
    WHERE user_id = NEW.sponsor_user_id;
    
    NEW.responded_at := now();
    NEW.updated_at := now();
  END IF;
  
  -- When a request is declined
  IF NEW.status = 'declined' AND OLD.status = 'pending' THEN
    NEW.responded_at := now();
    NEW.updated_at := now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop old trigger if exists and create new one
DROP TRIGGER IF EXISTS trigger_handle_sponsorship_acceptance_v2 ON sponsorship_requests;
CREATE TRIGGER trigger_handle_sponsorship_acceptance_v2
  BEFORE UPDATE ON sponsorship_requests
  FOR EACH ROW
  WHEN (NEW.status != OLD.status AND OLD.status = 'pending')
  EXECUTE FUNCTION handle_sponsorship_request_acceptance_v2();

-- Function to update sponsorship payment status
CREATE OR REPLACE FUNCTION update_sponsorship_payment_status_v2()
RETURNS TRIGGER AS $$
BEGIN
  -- Mark this sponsorship as the paying one
  UPDATE sponsorships
  SET 
    is_paying = true,
    subscription_plan_id = NEW.plan_id,
    updated_at = now()
  WHERE sponsor_id = NEW.sponsor_user_id 
    AND patient_id = NEW.patient_user_id;
  
  -- Mark other sponsors for this patient as not paying
  UPDATE sponsorships
  SET 
    is_paying = false,
    updated_at = now()
  WHERE patient_id = NEW.patient_user_id 
    AND sponsor_id != NEW.sponsor_user_id;
  
  -- Deactivate other sponsored subscriptions for this patient
  UPDATE sponsored_subscriptions
  SET is_active = false
  WHERE patient_user_id = NEW.patient_user_id 
    AND sponsor_user_id != NEW.sponsor_user_id
    AND is_active = true;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update payment status
DROP TRIGGER IF EXISTS trigger_update_sponsorship_payment_v2 ON sponsored_subscriptions;
CREATE TRIGGER trigger_update_sponsorship_payment_v2
  AFTER INSERT ON sponsored_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_sponsorship_payment_status_v2();

-- Function to update updated_at timestamp for sponsorship_requests
CREATE OR REPLACE FUNCTION update_sponsorship_requests_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS trigger_update_sponsorship_requests_timestamp ON sponsorship_requests;
CREATE TRIGGER trigger_update_sponsorship_requests_timestamp
  BEFORE UPDATE ON sponsorship_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_sponsorship_requests_timestamp();
