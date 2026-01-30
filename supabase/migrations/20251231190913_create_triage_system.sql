/*
  # Create Triage System

  ## Overview
  Complete triage system for symptom assessment with questions, sessions, and responses.

  ## New Tables
  
  ### `triage_questions`
  - `id` (uuid, primary key) - Unique question identifier
  - `symptom_id` (uuid) - Links to symptoms_catalog
  - `question_text` (text) - The question to ask
  - `question_type` (text) - Type: 'multiple_choice' or 'text_input'
  - `options` (jsonb) - Array of answer options for multiple choice
  - `order_number` (int) - Question sequence order
  - `created_at` (timestamptz)

  ### `triage_sessions`
  - `id` (uuid, primary key) - Unique session identifier
  - `user_id` (uuid) - User taking the triage
  - `symptom_id` (uuid) - The symptom being triaged
  - `symptom_name` (text) - Name of symptom for reference
  - `status` (text) - 'in_progress', 'completed', 'abandoned'
  - `nurse_name` (text) - Assigned virtual nurse name
  - `nurse_title` (text) - Nurse's title
  - `total_questions` (int) - Total number of questions
  - `current_question` (int) - Current question number
  - `started_at` (timestamptz)
  - `completed_at` (timestamptz)

  ### `triage_responses`
  - `id` (uuid, primary key)
  - `session_id` (uuid) - Links to triage_sessions
  - `question_id` (uuid) - Links to triage_questions
  - `question_text` (text) - Copy of question for history
  - `answer` (text) - User's answer
  - `answered_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Users can only access their own triage sessions and responses
  - Questions are readable by authenticated users
*/

-- Create triage_questions table
CREATE TABLE IF NOT EXISTS triage_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symptom_id uuid REFERENCES symptoms_catalog(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  question_type text NOT NULL CHECK (question_type IN ('multiple_choice', 'text_input')),
  options jsonb DEFAULT '[]'::jsonb,
  order_number int NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create triage_sessions table
CREATE TABLE IF NOT EXISTS triage_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  symptom_id uuid REFERENCES symptoms_catalog(id) ON DELETE SET NULL,
  symptom_name text NOT NULL,
  status text DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  nurse_name text DEFAULT 'Sophia from Vigor',
  nurse_title text DEFAULT 'Public Health Nurse',
  total_questions int DEFAULT 7,
  current_question int DEFAULT 0,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Create triage_responses table
CREATE TABLE IF NOT EXISTS triage_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES triage_sessions(id) ON DELETE CASCADE NOT NULL,
  question_id uuid REFERENCES triage_questions(id) ON DELETE SET NULL,
  question_text text NOT NULL,
  answer text NOT NULL,
  answered_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE triage_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE triage_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE triage_responses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for triage_questions
CREATE POLICY "Authenticated users can view questions"
  ON triage_questions FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for triage_sessions
CREATE POLICY "Users can view own triage sessions"
  ON triage_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own triage sessions"
  ON triage_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own triage sessions"
  ON triage_sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for triage_responses
CREATE POLICY "Users can view own triage responses"
  ON triage_responses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM triage_sessions
      WHERE triage_sessions.id = triage_responses.session_id
      AND triage_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own triage responses"
  ON triage_responses FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM triage_sessions
      WHERE triage_sessions.id = triage_responses.session_id
      AND triage_sessions.user_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_triage_questions_symptom ON triage_questions(symptom_id, order_number);
CREATE INDEX IF NOT EXISTS idx_triage_sessions_user ON triage_sessions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_triage_responses_session ON triage_responses(session_id);

-- Insert sample questions for Headache symptom
DO $$
DECLARE
  headache_id uuid;
BEGIN
  -- Get headache symptom ID
  SELECT id INTO headache_id FROM symptoms_catalog WHERE name = 'Headache' LIMIT 1;
  
  IF headache_id IS NOT NULL THEN
    -- Insert sample triage questions
    INSERT INTO triage_questions (symptom_id, question_text, question_type, options, order_number)
    VALUES
      (headache_id, 'How long have you been experiencing this headache?', 'multiple_choice', 
       '["Less than a day", "1-3 days", "More than 3 days"]'::jsonb, 1),
      (headache_id, 'Can you describe the headache?', 'multiple_choice',
       '["Throbbing / Pulsating", "Steady / Pressure-like", "Sharp / Stabbing", "Other"]'::jsonb, 2),
      (headache_id, 'Where is the pain located?', 'multiple_choice',
       '["Front of head", "Back of head", "One side", "All over"]'::jsonb, 3),
      (headache_id, 'How severe is the pain on a scale of 1-10?', 'multiple_choice',
       '["1-3 (Mild)", "4-6 (Moderate)", "7-10 (Severe)"]'::jsonb, 4),
      (headache_id, 'Do you have any other symptoms?', 'multiple_choice',
       '["Nausea", "Sensitivity to light", "Dizziness", "None", "Other"]'::jsonb, 5),
      (headache_id, 'Have you taken any medication for this?', 'multiple_choice',
       '["Yes, it helped", "Yes, but no relief", "No"]'::jsonb, 6),
      (headache_id, 'Is there anything that makes it better or worse?', 'text_input',
       '[]'::jsonb, 7)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;