/*
  # Add Profile Location and Emergency Contacts

  1. Profile Table Updates
    - Add `country_of_residence` (text) - User's country
    - Add `state` (text) - User's state/region

  2. New Tables
    - `emergency_contacts`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `name` (text) - Contact's full name
      - `relationship` (text) - Relationship to user (e.g., Spouse, Parent, Sibling)
      - `phone_number` (text) - Contact's phone
      - `email` (text) - Contact's email
      - `country_of_residence` (text) - Contact's country
      - `state` (text) - Contact's state/region
      - `is_primary` (boolean) - Flag for primary emergency contact
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  3. Security
    - Enable RLS on emergency_contacts table
    - Add policies for authenticated users to manage their own emergency contacts
*/

-- Add location fields to user_profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'country_of_residence'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN country_of_residence text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'state'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN state text;
  END IF;
END $$;

-- Create emergency contacts table
CREATE TABLE IF NOT EXISTS emergency_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  relationship text NOT NULL,
  phone_number text NOT NULL,
  email text,
  country_of_residence text,
  state text,
  is_primary boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;

-- Emergency contacts policies
CREATE POLICY "Users can view own emergency contacts"
  ON emergency_contacts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own emergency contacts"
  ON emergency_contacts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own emergency contacts"
  ON emergency_contacts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own emergency contacts"
  ON emergency_contacts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_user_id ON emergency_contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_is_primary ON emergency_contacts(user_id, is_primary) WHERE is_primary = true;
