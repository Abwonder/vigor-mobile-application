/*
  # Add Missing Health Record Tables

  1. New Tables
    - `allergies` - Patient allergies and reactions
    - `conditions` - Medical conditions and diagnoses
    - `surgical_history` - Past surgeries and procedures
    - `family_history` - Family medical history
    - `social_history` - Patient social and lifestyle information
    - `immunizations` - Vaccination records
    - `vitals` - Vital signs and measurements
    - `lab_results` - Laboratory test results
    - `care_team` - Healthcare providers
    - `tests_and_results` - Scheduled and completed tests
    - `medical_documents` - Reports, referrals, and documents
    - `care_status` - Current care status tracking

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own health records
*/

-- Allergies Table
CREATE TABLE IF NOT EXISTS allergies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  allergen text NOT NULL,
  reaction text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('mild', 'moderate', 'severe')),
  recorded_date date NOT NULL DEFAULT CURRENT_DATE,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE allergies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own allergies"
  ON allergies FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own allergies"
  ON allergies FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own allergies"
  ON allergies FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own allergies"
  ON allergies FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Conditions Table
CREATE TABLE IF NOT EXISTS conditions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  condition text NOT NULL,
  diagnosis_date date NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'chronic')),
  icd_code text,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE conditions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own conditions"
  ON conditions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conditions"
  ON conditions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conditions"
  ON conditions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own conditions"
  ON conditions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Surgical History Table
CREATE TABLE IF NOT EXISTS surgical_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  procedure text NOT NULL,
  surgery_date date NOT NULL,
  hospital text,
  surgeon text,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE surgical_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own surgical history"
  ON surgical_history FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own surgical history"
  ON surgical_history FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own surgical history"
  ON surgical_history FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own surgical history"
  ON surgical_history FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Family History Table
CREATE TABLE IF NOT EXISTS family_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  relation text NOT NULL,
  condition text NOT NULL,
  age_of_onset integer,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE family_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own family history"
  ON family_history FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own family history"
  ON family_history FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own family history"
  ON family_history FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own family history"
  ON family_history FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Social History Table
CREATE TABLE IF NOT EXISTS social_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  smoking_status text DEFAULT 'never' CHECK (smoking_status IN ('never', 'former', 'current')),
  alcohol_use text DEFAULT 'none' CHECK (alcohol_use IN ('none', 'occasional', 'moderate', 'heavy')),
  exercise_frequency text,
  occupation text,
  marital_status text,
  living_situation text,
  diet text,
  notes text,
  updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE social_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own social history"
  ON social_history FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own social history"
  ON social_history FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own social history"
  ON social_history FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own social history"
  ON social_history FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Immunizations Table
CREATE TABLE IF NOT EXISTS immunizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  vaccine text NOT NULL,
  date_administered date NOT NULL,
  lot_number text,
  site text,
  administered_by text,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE immunizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own immunizations"
  ON immunizations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own immunizations"
  ON immunizations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own immunizations"
  ON immunizations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own immunizations"
  ON immunizations FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Vitals Table
CREATE TABLE IF NOT EXISTS vitals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  measurement_date timestamptz NOT NULL DEFAULT now(),
  blood_pressure_systolic integer,
  blood_pressure_diastolic integer,
  heart_rate integer,
  temperature decimal(4,1),
  weight decimal(5,1),
  height decimal(5,1),
  bmi decimal(4,1),
  respiratory_rate integer,
  oxygen_saturation integer,
  recorded_by text,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE vitals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own vitals"
  ON vitals FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own vitals"
  ON vitals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own vitals"
  ON vitals FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own vitals"
  ON vitals FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Lab Results Table
CREATE TABLE IF NOT EXISTS lab_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  test_name text NOT NULL,
  test_date date NOT NULL,
  value text NOT NULL,
  unit text,
  reference_range text,
  status text NOT NULL DEFAULT 'normal' CHECK (status IN ('normal', 'abnormal', 'critical')),
  ordered_by text,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE lab_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own lab results"
  ON lab_results FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own lab results"
  ON lab_results FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own lab results"
  ON lab_results FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own lab results"
  ON lab_results FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Care Team Table
CREATE TABLE IF NOT EXISTS care_team (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('primary_physician', 'specialist', 'hospital', 'other')),
  name text NOT NULL,
  specialty text,
  organization text,
  phone text,
  email text,
  address text,
  is_primary boolean DEFAULT false,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE care_team ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own care team"
  ON care_team FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own care team"
  ON care_team FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own care team"
  ON care_team FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own care team"
  ON care_team FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Tests and Results Table
CREATE TABLE IF NOT EXISTS tests_and_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  test_name text NOT NULL,
  test_type text NOT NULL CHECK (test_type IN ('lab', 'imaging', 'diagnostic', 'other')),
  scheduled_date timestamptz,
  completed_date timestamptz,
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'pending')),
  ordered_by text,
  results_summary text,
  results_url text,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE tests_and_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tests and results"
  ON tests_and_results FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tests and results"
  ON tests_and_results FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tests and results"
  ON tests_and_results FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own tests and results"
  ON tests_and_results FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Medical Documents Table
CREATE TABLE IF NOT EXISTS medical_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  document_type text NOT NULL CHECK (document_type IN ('referral', 'discharge_summary', 'clinical_note', 'report', 'other')),
  title text NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  provider text,
  document_url text,
  summary text,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE medical_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own medical documents"
  ON medical_documents FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own medical documents"
  ON medical_documents FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own medical documents"
  ON medical_documents FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own medical documents"
  ON medical_documents FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Care Status Table
CREATE TABLE IF NOT EXISTS care_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  status text NOT NULL CHECK (status IN ('active_treatment', 'monitoring', 'stable', 'follow_up_needed')),
  duration text,
  last_update timestamptz NOT NULL DEFAULT now(),
  next_appointment timestamptz,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE care_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own care status"
  ON care_status FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own care status"
  ON care_status FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own care status"
  ON care_status FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own care status"
  ON care_status FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_allergies_user_id ON allergies(user_id);
CREATE INDEX IF NOT EXISTS idx_conditions_user_id ON conditions(user_id);
CREATE INDEX IF NOT EXISTS idx_surgical_history_user_id ON surgical_history(user_id);
CREATE INDEX IF NOT EXISTS idx_family_history_user_id ON family_history(user_id);
CREATE INDEX IF NOT EXISTS idx_social_history_user_id ON social_history(user_id);
CREATE INDEX IF NOT EXISTS idx_immunizations_user_id ON immunizations(user_id);
CREATE INDEX IF NOT EXISTS idx_vitals_user_id ON vitals(user_id);
CREATE INDEX IF NOT EXISTS idx_lab_results_user_id ON lab_results(user_id);
CREATE INDEX IF NOT EXISTS idx_care_team_user_id ON care_team(user_id);
CREATE INDEX IF NOT EXISTS idx_tests_and_results_user_id ON tests_and_results(user_id);
CREATE INDEX IF NOT EXISTS idx_medical_documents_user_id ON medical_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_care_status_user_id ON care_status(user_id);