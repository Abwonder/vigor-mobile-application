/*
  # Create Sponsor Connections System

  1. New Tables
    - `sponsor_connections`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users) - The care recipient
      - `sponsor_name` (text) - Sponsor's full name
      - `sponsor_email` (text) - Sponsor's email address
      - `sponsor_phone` (text) - Sponsor's phone number
      - `sponsor_reference` (text) - Unique reference code for this sponsor relationship
      - `subscription_id` (uuid, foreign key to user_subscriptions) - Related subscription
      - `status` (text) - "pending", "active", "inactive", "declined"
      - `connected_at` (timestamptz) - When the connection was established
      - `metadata` (jsonb) - Additional sponsor information
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on sponsor_connections table
    - Users can view their own sponsor connections
    - Users can create sponsor connections for themselves
    - Authenticated users only

  3. Indexes
    - Index on user_id for fast lookups
    - Index on sponsor_reference for quick reference validation
    - Index on status for filtering active/pending connections
*/

-- Create sponsor_connections table
CREATE TABLE IF NOT EXISTS sponsor_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sponsor_name text NOT NULL,
  sponsor_email text NOT NULL,
  sponsor_phone text NOT NULL,
  sponsor_reference text UNIQUE NOT NULL,
  subscription_id uuid REFERENCES user_subscriptions(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'inactive', 'declined')),
  connected_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_sponsor_connections_user_id ON sponsor_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_sponsor_connections_reference ON sponsor_connections(sponsor_reference);
CREATE INDEX IF NOT EXISTS idx_sponsor_connections_status ON sponsor_connections(status);
CREATE INDEX IF NOT EXISTS idx_sponsor_connections_email ON sponsor_connections(sponsor_email);

-- Enable RLS
ALTER TABLE sponsor_connections ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sponsor_connections
CREATE POLICY "Users can view own sponsor connections"
  ON sponsor_connections FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own sponsor connections"
  ON sponsor_connections FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sponsor connections"
  ON sponsor_connections FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Function to auto-activate sponsor connection when payment is completed
CREATE OR REPLACE FUNCTION activate_sponsor_connection()
RETURNS TRIGGER AS $$
BEGIN
  -- When a payment transaction is marked as completed and has sponsor metadata
  IF NEW.status = 'completed' AND NEW.payment_method = 'sponsor' THEN
    -- Update the sponsor connection to active
    UPDATE sponsor_connections
    SET 
      status = 'active',
      connected_at = now(),
      updated_at = now()
    WHERE subscription_id = NEW.subscription_id
      AND status = 'pending';
    
    -- Update the subscription to active
    UPDATE user_subscriptions
    SET 
      status = 'active',
      starts_at = now(),
      expires_at = CASE 
        WHEN billing_cycle = 'monthly' THEN now() + interval '1 month'
        WHEN billing_cycle = 'yearly' THEN now() + interval '1 year'
        ELSE now() + interval '1 month'
      END,
      updated_at = now()
    WHERE id = NEW.subscription_id
      AND status = 'pending';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to activate sponsor connection on payment completion
DROP TRIGGER IF EXISTS trigger_activate_sponsor_connection ON payment_transactions;
CREATE TRIGGER trigger_activate_sponsor_connection
  AFTER UPDATE ON payment_transactions
  FOR EACH ROW
  WHEN (NEW.status = 'completed' AND OLD.status != 'completed')
  EXECUTE FUNCTION activate_sponsor_connection();
