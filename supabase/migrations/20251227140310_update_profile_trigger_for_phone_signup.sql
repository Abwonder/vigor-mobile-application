/*
  # Update Profile Trigger for Phone Signup

  1. Changes
    - Update handle_new_user() function to extract phone number from user metadata
    - Set phone_number in profiles when signup_method is 'phone'
    - Handle both email and phone signup flows

  2. Purpose
    - Support phone-based signup workflow
    - Automatically populate phone_number field during account creation
*/

-- Drop and recreate the function with phone support
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    email_verified,
    phone_number,
    phone_verified
  )
  VALUES (
    new.id, 
    new.email, 
    new.email_confirmed_at IS NOT NULL,
    COALESCE(new.raw_user_meta_data->>'phone', NULL),
    false
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
