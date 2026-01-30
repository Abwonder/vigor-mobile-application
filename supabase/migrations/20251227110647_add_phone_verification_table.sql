/*
  # Phone Verification System

  1. New Tables
    - `phone_verifications`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `phone_number` (text)
      - `verification_code` (text)
      - `verified` (boolean)
      - `created_at` (timestamptz)
      - `expires_at` (timestamptz)
  
  2. Changes to Existing Tables
    - `user_profiles`
      - Add `phone_verified` (boolean, default false)
  
  3. Security
    - Enable RLS on `phone_verifications` table
    - Add policies for users to manage their own verification records
*/

-- Create phone_verifications table
CREATE TABLE IF NOT EXISTS phone_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  phone_number text NOT NULL,
  verification_code text NOT NULL,
  verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL
);

-- Add phone_verified column to user_profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'phone_verified'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN phone_verified boolean DEFAULT false;
  END IF;
END $$;

-- Enable RLS
ALTER TABLE phone_verifications ENABLE ROW LEVEL SECURITY;

-- Policies for phone_verifications
CREATE POLICY "Users can view own verification records"
  ON phone_verifications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own verification records"
  ON phone_verifications
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own verification records"
  ON phone_verifications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_phone_verifications_user_id ON phone_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_phone_verifications_phone_number ON phone_verifications(phone_number);