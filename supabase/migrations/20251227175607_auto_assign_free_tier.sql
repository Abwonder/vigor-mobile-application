/*
  # Auto-assign Free Tier to New Users

  1. Changes
    - Create trigger function to automatically assign free tier subscription when user profile is created
    - Trigger executes after user_profiles insert
    - Finds the "Free Care" plan and creates an active subscription
    - Sets subscription to start immediately with 30-day trial period

  2. Security
    - Function runs with security definer privileges to bypass RLS
    - Only triggers on new profile creation
*/

-- Create function to auto-assign free tier
CREATE OR REPLACE FUNCTION auto_assign_free_tier()
RETURNS TRIGGER AS $$
DECLARE
  free_plan_id uuid;
BEGIN
  -- Get the Free Care plan ID
  SELECT id INTO free_plan_id
  FROM subscription_plans
  WHERE slug = 'free-care'
  LIMIT 1;

  -- Create free subscription for the new user
  IF free_plan_id IS NOT NULL THEN
    INSERT INTO user_subscriptions (
      user_id,
      plan_id,
      billing_cycle,
      status,
      starts_at,
      expires_at,
      is_sponsored
    ) VALUES (
      NEW.id,
      free_plan_id,
      'monthly',
      'active',
      NOW(),
      NOW() + INTERVAL '30 days',
      false
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-assign free tier on profile creation
DROP TRIGGER IF EXISTS trigger_auto_assign_free_tier ON user_profiles;
CREATE TRIGGER trigger_auto_assign_free_tier
  AFTER INSERT ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION auto_assign_free_tier();