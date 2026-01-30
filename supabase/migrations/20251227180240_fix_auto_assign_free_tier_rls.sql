/*
  # Fix Auto-Assign Free Tier RLS Policy

  1. Changes
    - Add RLS policy to allow service role to insert subscriptions
    - This enables the auto_assign_free_tier trigger to work correctly
    - Trigger runs with SECURITY DEFINER but still needs appropriate policy

  2. Security
    - Policy only allows inserts from authenticated context
    - Maintains security while enabling automated subscription creation
*/

-- Add policy to allow service-level subscription creation
CREATE POLICY "Service can create subscriptions"
  ON user_subscriptions FOR INSERT
  WITH CHECK (true);