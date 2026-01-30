/*
  # Auto-create Health Profile Trigger

  1. Function
    - `create_health_profile_for_user()` - Automatically creates a health profile when a user profile is created
  
  2. Trigger
    - Runs after INSERT on `user_profiles` table
    - Creates corresponding health profile entry

  3. Security
    - Ensures every user has a health profile for tracking completion progress
*/

-- Function to create health profile automatically
CREATE OR REPLACE FUNCTION create_health_profile_for_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO health_profiles (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create health profile
DROP TRIGGER IF EXISTS create_health_profile_trigger ON user_profiles;

CREATE TRIGGER create_health_profile_trigger
  AFTER INSERT ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_health_profile_for_user();