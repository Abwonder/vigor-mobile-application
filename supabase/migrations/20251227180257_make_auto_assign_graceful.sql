/*
  # Make Auto-Assign Free Tier Graceful

  1. Changes
    - Update auto_assign_free_tier function to handle errors gracefully
    - Use EXCEPTION block to catch and log errors without failing the transaction
    - This prevents user profile creation from failing if subscription creation has issues

  2. Security
    - Maintains existing security while preventing transaction rollback
    - Logs errors for debugging
*/

-- Recreate function with error handling
CREATE OR REPLACE FUNCTION auto_assign_free_tier()
RETURNS TRIGGER AS $$
DECLARE
  free_plan_id uuid;
BEGIN
  BEGIN
    -- Get the Free Care plan ID
    SELECT id INTO free_plan_id
    FROM subscription_plans
    WHERE slug = 'free-care'
    LIMIT 1;

    -- Create free subscription for the new user if plan exists
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
    ELSE
      RAISE WARNING 'Free Care plan not found, skipping auto-assignment for user %', NEW.id;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    -- Log error but don't fail the user profile creation
    RAISE WARNING 'Failed to auto-assign free tier for user %: %', NEW.id, SQLERRM;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;