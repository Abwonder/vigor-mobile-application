/*
  # Add Error Handling to Profile Creation Trigger

  1. Changes
    - Update handle_new_user_profile function to include graceful error handling
    - Prevents auth user creation from failing if profile creation has issues
    - Logs errors for debugging while allowing signup to succeed

  2. Security
    - Maintains SECURITY DEFINER for proper permissions
    - Ensures user signup always succeeds even if profile creation fails temporarily
*/

-- Recreate function with error handling
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS trigger AS $$
BEGIN
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
  EXCEPTION WHEN OTHERS THEN
    -- Log error but don't fail the auth user creation
    RAISE WARNING 'Failed to create user profile for user %: %', new.id, SQLERRM;
  END;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;