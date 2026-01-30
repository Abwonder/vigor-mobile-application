/*
  # Remove Overly Permissive Policy

  1. Changes
    - Remove the "Service can create subscriptions" policy
    - It was too permissive and not needed with the graceful error handling

  2. Security
    - Maintains proper RLS security
    - Trigger function with SECURITY DEFINER handles subscription creation
*/

-- Remove the overly permissive policy
DROP POLICY IF EXISTS "Service can create subscriptions" ON user_subscriptions;