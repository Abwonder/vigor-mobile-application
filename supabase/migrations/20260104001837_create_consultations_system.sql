/*
  # Create Consultations System

  ## Overview
  Creates a dedicated consultation system for patients to communicate with healthcare providers
  (Public Health Nurses and Specialists) with support for triage-based assignments, status tracking,
  and consultation-specific features.

  ## 1. New Tables

  ### consultations
  Manages consultation sessions between patients and healthcare providers
  - `id` (uuid, primary key) - Unique consultation identifier
  - `patient_id` (uuid) - References auth.users (patient)
  - `provider_id` (uuid) - References auth.users (healthcare provider)
  - `provider_type` (text) - 'nurse' or 'specialist'
  - `conversation_id` (uuid) - References conversations table
  - `triage_session_id` (uuid) - Optional reference to triage_sessions
  - `status` (text) - 'pending', 'active', 'waiting_for_provider', 'completed', 'cancelled'
  - `specialty` (text) - Medical specialty (e.g., 'Cardiology', 'General Practice')
  - `started_at` (timestamptz) - When consultation started
  - `ended_at` (timestamptz) - When consultation ended
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### consultation_system_messages
  Tracks system-generated messages in consultations (e.g., "Connected with specialist")
  - `id` (uuid, primary key) - Unique system message identifier
  - `consultation_id` (uuid) - References consultations table
  - `message_type` (text) - 'connected', 'waiting', 'specialist_assigned', etc.
  - `message_content` (text) - The system message text
  - `created_at` (timestamptz) - When message was generated

  ## 2. Security
  - Row Level Security (RLS) enabled on all tables
  - Patients can only view their own consultations
  - Providers can only view consultations assigned to them
  - System messages visible to consultation participants

  ## 3. Indexes
  - Indexed foreign keys for optimal query performance
  - Status and provider_type indexes for filtering
*/

-- Create consultations table
CREATE TABLE IF NOT EXISTS consultations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  provider_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  provider_type text NOT NULL CHECK (provider_type IN ('nurse', 'specialist')),
  conversation_id uuid REFERENCES conversations(id) ON DELETE SET NULL,
  triage_session_id uuid,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'waiting_for_provider', 'completed', 'cancelled')),
  specialty text,
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create consultation_system_messages table
CREATE TABLE IF NOT EXISTS consultation_system_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id uuid REFERENCES consultations(id) ON DELETE CASCADE NOT NULL,
  message_type text NOT NULL CHECK (message_type IN ('connected', 'waiting', 'specialist_assigned', 'consultation_started', 'consultation_ended')),
  message_content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_consultations_patient ON consultations(patient_id);
CREATE INDEX IF NOT EXISTS idx_consultations_provider ON consultations(provider_id);
CREATE INDEX IF NOT EXISTS idx_consultations_status ON consultations(status);
CREATE INDEX IF NOT EXISTS idx_consultations_provider_type ON consultations(provider_type);
CREATE INDEX IF NOT EXISTS idx_consultations_conversation ON consultations(conversation_id);
CREATE INDEX IF NOT EXISTS idx_consultation_system_messages_consultation ON consultation_system_messages(consultation_id);

-- Enable Row Level Security
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultation_system_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for consultations
CREATE POLICY "Patients can view their own consultations"
  ON consultations FOR SELECT
  TO authenticated
  USING (patient_id = auth.uid());

CREATE POLICY "Providers can view their assigned consultations"
  ON consultations FOR SELECT
  TO authenticated
  USING (provider_id = auth.uid());

CREATE POLICY "Users can create consultations as patients"
  ON consultations FOR INSERT
  TO authenticated
  WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Patients can update their own consultations"
  ON consultations FOR UPDATE
  TO authenticated
  USING (patient_id = auth.uid())
  WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Providers can update their assigned consultations"
  ON consultations FOR UPDATE
  TO authenticated
  USING (provider_id = auth.uid())
  WITH CHECK (provider_id = auth.uid());

-- RLS Policies for consultation_system_messages
CREATE POLICY "Users can view system messages in their consultations"
  ON consultation_system_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM consultations
      WHERE consultations.id = consultation_system_messages.consultation_id
      AND (consultations.patient_id = auth.uid() OR consultations.provider_id = auth.uid())
    )
  );

CREATE POLICY "System can insert system messages"
  ON consultation_system_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM consultations
      WHERE consultations.id = consultation_system_messages.consultation_id
      AND (consultations.patient_id = auth.uid() OR consultations.provider_id = auth.uid())
    )
  );

-- Function to update consultation's updated_at timestamp
CREATE OR REPLACE FUNCTION update_consultation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update consultation on update
DROP TRIGGER IF EXISTS on_consultation_updated ON consultations;
CREATE TRIGGER on_consultation_updated
  BEFORE UPDATE ON consultations
  FOR EACH ROW
  EXECUTE FUNCTION update_consultation_timestamp();