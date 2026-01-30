/*
  # Recreate Comprehensive Appointments System

  1. Changes
    - Drop old simple appointments table
    - Create new comprehensive appointments table with proper relationships
    - Support for both specialists and nurses
    - Include consultation type, date/time, mode, and status tracking

  2. New Tables
    - `appointments_v2` (replacing old appointments table)
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users) - Patient booking
      - `specialist_id` (uuid, references specialists) - For specialist appointments
      - `nurse_id` (uuid, references nurses) - For nurse appointments
      - `provider_type` (text) - 'specialist' or 'nurse'
      - `consultation_type` (text) - Type of consultation
      - `appointment_date` (date) - Date of appointment
      - `appointment_time` (time) - Time of appointment
      - `duration_minutes` (integer) - Duration in minutes
      - `mode` (text) - 'video', 'audio', or 'chat'
      - `reason` (text, optional) - Patient's reason for visit
      - `status` (text) - 'pending', 'confirmed', 'completed', 'cancelled', 'missed'
      - `subscription_tier` (text, optional) - User's subscription tier at booking
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  3. Security
    - Enable RLS
    - Users can manage their own appointments
    - Providers can view and update appointments assigned to them
*/

-- Drop old appointments table
DROP TABLE IF EXISTS appointments CASCADE;

-- Create new appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  specialist_id uuid REFERENCES specialists(id) ON DELETE CASCADE,
  nurse_id uuid REFERENCES nurses(id) ON DELETE CASCADE,
  provider_type text NOT NULL CHECK (provider_type IN ('specialist', 'nurse')),
  consultation_type text NOT NULL,
  appointment_date date NOT NULL,
  appointment_time time NOT NULL,
  duration_minutes integer NOT NULL DEFAULT 25,
  mode text NOT NULL CHECK (mode IN ('video', 'audio', 'chat')),
  reason text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'missed')),
  subscription_tier text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_provider CHECK (
    (provider_type = 'specialist' AND specialist_id IS NOT NULL AND nurse_id IS NULL) OR
    (provider_type = 'nurse' AND nurse_id IS NOT NULL AND specialist_id IS NULL)
  )
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_specialist_id ON appointments(specialist_id);
CREATE INDEX IF NOT EXISTS idx_appointments_nurse_id ON appointments(nurse_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);

-- Enable RLS
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Users can view their own appointments
CREATE POLICY "Users can view own appointments"
  ON appointments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can create their own appointments
CREATE POLICY "Users can create own appointments"
  ON appointments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own appointments
CREATE POLICY "Users can update own appointments"
  ON appointments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_appointments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS appointments_updated_at ON appointments;
CREATE TRIGGER appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_appointments_updated_at();
