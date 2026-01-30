/*
  # Add role and consent fields to user profiles

  1. Changes
    - Add `role` column to user_profiles table (service_user or sponsor)
    - Add `profile_photo_url` column for storing profile pictures
    - Add `consent_agreed` boolean column
    - Add `consent_agreed_at` timestamp column

  2. Security
    - No changes to RLS policies (already configured)
*/

DO $$
BEGIN
  -- Add role column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'role'
  ) THEN
    ALTER TABLE user_profiles 
    ADD COLUMN role text DEFAULT 'service_user' CHECK (role IN ('service_user', 'sponsor'));
  END IF;

  -- Add profile_photo_url column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'profile_photo_url'
  ) THEN
    ALTER TABLE user_profiles 
    ADD COLUMN profile_photo_url text;
  END IF;

  -- Add consent_agreed column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'consent_agreed'
  ) THEN
    ALTER TABLE user_profiles 
    ADD COLUMN consent_agreed boolean DEFAULT false;
  END IF;

  -- Add consent_agreed_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'consent_agreed_at'
  ) THEN
    ALTER TABLE user_profiles 
    ADD COLUMN consent_agreed_at timestamptz;
  END IF;
END $$;
