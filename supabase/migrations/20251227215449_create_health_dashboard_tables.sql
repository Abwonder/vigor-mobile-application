/*
  # Health Dashboard Database Schema

  1. New Tables
    - `health_profiles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `allergies` (jsonb array)
      - `conditions` (jsonb array)
      - `surgical_history` (jsonb array)
      - `family_history` (jsonb array)
      - `immunizations` (jsonb array)
      - `profile_completion_step` (integer, tracks 1/5 progress)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `appointments`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `provider_name` (text)
      - `appointment_type` (text)
      - `scheduled_date` (timestamp)
      - `status` (text - scheduled, completed, cancelled)
      - `notes` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `medications`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `medication_name` (text)
      - `dosage` (text)
      - `frequency` (text)
      - `start_date` (date)
      - `end_date` (date, nullable)
      - `active` (boolean)
      - `notes` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `care_packages`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `package_name` (text)
      - `description` (text)
      - `start_date` (date)
      - `end_date` (date, nullable)
      - `active` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `symptoms_catalog`
      - `id` (uuid, primary key)
      - `name` (text)
      - `category` (text)
      - `common` (boolean)
      - `description` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Health Profiles Table
CREATE TABLE IF NOT EXISTS health_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  allergies jsonb DEFAULT '[]'::jsonb,
  conditions jsonb DEFAULT '[]'::jsonb,
  surgical_history jsonb DEFAULT '[]'::jsonb,
  family_history jsonb DEFAULT '[]'::jsonb,
  immunizations jsonb DEFAULT '[]'::jsonb,
  profile_completion_step integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE health_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own health profile"
  ON health_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own health profile"
  ON health_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own health profile"
  ON health_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Appointments Table
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  provider_name text NOT NULL,
  appointment_type text NOT NULL,
  scheduled_date timestamptz NOT NULL,
  status text DEFAULT 'scheduled',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own appointments"
  ON appointments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own appointments"
  ON appointments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own appointments"
  ON appointments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own appointments"
  ON appointments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Medications Table
CREATE TABLE IF NOT EXISTS medications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  medication_name text NOT NULL,
  dosage text NOT NULL,
  frequency text NOT NULL,
  start_date date NOT NULL,
  end_date date,
  active boolean DEFAULT true,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE medications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own medications"
  ON medications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own medications"
  ON medications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own medications"
  ON medications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own medications"
  ON medications FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Care Packages Table
CREATE TABLE IF NOT EXISTS care_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  package_name text NOT NULL,
  description text,
  start_date date NOT NULL,
  end_date date,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE care_packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own care packages"
  ON care_packages FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own care packages"
  ON care_packages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own care packages"
  ON care_packages FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Symptoms Catalog Table (shared reference data)
CREATE TABLE IF NOT EXISTS symptoms_catalog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  common boolean DEFAULT false,
  description text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE symptoms_catalog ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view symptoms catalog"
  ON symptoms_catalog FOR SELECT
  TO authenticated
  USING (true);

-- Insert common symptoms data
INSERT INTO symptoms_catalog (name, category, common) VALUES
  ('Fever', 'General Symptoms', true),
  ('Joint pain', 'General Symptoms', true),
  ('Menstrual issues', 'General Symptoms', true),
  ('Diabetes', 'General Symptoms', true),
  ('High Blood Pressure (Hypertension)', 'General Symptoms', true),
  ('Low Blood Pressure', 'General Symptoms', true),
  ('Headaches', 'General Symptoms', false),
  ('Heartburn', 'Stomach & Digestion', false),
  ('Hemorrhoids', 'Stomach & Digestion', false),
  ('Cough', 'Respiratory & Chest', false),
  ('Chest pain', 'Respiratory & Chest', false),
  ('Breathing trouble', 'Respiratory & Chest', false)
ON CONFLICT DO NOTHING;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_appointments_user_date ON appointments(user_id, scheduled_date);
CREATE INDEX IF NOT EXISTS idx_medications_user_active ON medications(user_id, active);
CREATE INDEX IF NOT EXISTS idx_care_packages_user_active ON care_packages(user_id, active);
CREATE INDEX IF NOT EXISTS idx_symptoms_common ON symptoms_catalog(common);
CREATE INDEX IF NOT EXISTS idx_symptoms_category ON symptoms_catalog(category);