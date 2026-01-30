/*
  # Create User Profiles Trigger

  1. Purpose
    - Automatically create user_profiles record when user signs up
    - Extract phone number from user metadata for phone signups
    - Handle both email and phone signup flows

  2. Changes
    - Create function to handle new user creation in user_profiles table
    - Create trigger on auth.users table to call the function
*/

-- Function to automatically create user profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (
    id, 
    email,
    phone_number,
    phone_verified
  )
  VALUES (
    new.id, 
    new.email,
    COALESCE(new.raw_user_meta_data->>'phone', NULL),
    false
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;

-- Create trigger to create user profile on signup
CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_profile();
