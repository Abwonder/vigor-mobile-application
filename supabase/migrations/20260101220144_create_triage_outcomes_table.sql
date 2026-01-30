/*
  # Create Triage Outcomes Table

  ## Description
  Stores the results of completed triage sessions including severity assessment,
  recommendations, and assigned nurse information.

  ## New Table
  
  ### `triage_outcomes`
  - `id` (uuid, primary key) - Unique outcome identifier
  - `session_id` (uuid, unique, references triage_sessions) - Links to triage session
  - `user_id` (uuid, references auth.users) - User who completed triage
  - `symptom_name` (text) - Symptom being assessed
  - `severity` (text) - Severity level: 'emergency', 'caution', 'low_risk'
  - `severity_title` (text) - Human-readable title (e.g., "This may be an emergency.")
  - `severity_description` (text) - Detailed explanation of the severity assessment
  - `symptoms_summary` (text) - Summary of reported symptoms
  - `recommendation` (text) - Recommended next steps
  - `nurse_id` (uuid, optional) - Assigned nurse
  - `nurse_name` (text) - Name of nurse who reviewed
  - `estimated_wait_minutes` (int) - Estimated wait time in minutes
  - `specialist_assigned` (boolean, default false) - Whether specialist was assigned
  - `specialist_id` (uuid, optional) - Assigned specialist ID
  - `created_at` (timestamptz) - When outcome was generated
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  - Enable RLS on triage_outcomes table
  - Users can only view their own outcomes
  - Users can create outcomes for their own sessions
  - Users can update their own outcomes (for specialist assignment)
*/

CREATE TABLE IF NOT EXISTS triage_outcomes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid UNIQUE REFERENCES triage_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  symptom_name text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('emergency', 'caution', 'low_risk')),
  severity_title text NOT NULL,
  severity_description text NOT NULL,
  symptoms_summary text NOT NULL,
  recommendation text,
  nurse_id uuid REFERENCES nurses(id) ON DELETE SET NULL,
  nurse_name text NOT NULL,
  estimated_wait_minutes int DEFAULT 15,
  specialist_assigned boolean DEFAULT false,
  specialist_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE triage_outcomes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for triage_outcomes
CREATE POLICY "Users can view own triage outcomes"
  ON triage_outcomes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own triage outcomes"
  ON triage_outcomes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own triage outcomes"
  ON triage_outcomes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_triage_outcomes_user ON triage_outcomes(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_triage_outcomes_session ON triage_outcomes(session_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_triage_outcome_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_triage_outcome_timestamp
  BEFORE UPDATE ON triage_outcomes
  FOR EACH ROW
  EXECUTE FUNCTION update_triage_outcome_timestamp();
