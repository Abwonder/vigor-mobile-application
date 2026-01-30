/*
  # Add Audio Call State Tracking

  ## Overview
  Extends the consultations table to track audio call states and metadata for the audio consultation workflow.

  ## Changes
  
  ### Modified Tables
  - `consultations` table - Added audio call state columns:
    - `call_status` (text) - Current call status: 'idle', 'ringing', 'connected', 'ended', 'missed'
    - `call_initiated_by` (uuid) - References auth.users, tracks who initiated the call
    - `call_initiated_at` (timestamptz) - When the call was initiated
    - `call_connected_at` (timestamptz) - When the call was answered/connected
  
  ## Notes
  - All new fields are nullable to maintain backward compatibility
  - call_status defaults to 'idle' for new consultations
  - Supports tracking missed calls and call duration calculations
*/

-- Add audio call state tracking fields
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'consultations' AND column_name = 'call_status'
  ) THEN
    ALTER TABLE consultations ADD COLUMN call_status text DEFAULT 'idle' 
      CHECK (call_status IN ('idle', 'ringing', 'connected', 'ended', 'missed'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'consultations' AND column_name = 'call_initiated_by'
  ) THEN
    ALTER TABLE consultations ADD COLUMN call_initiated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'consultations' AND column_name = 'call_initiated_at'
  ) THEN
    ALTER TABLE consultations ADD COLUMN call_initiated_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'consultations' AND column_name = 'call_connected_at'
  ) THEN
    ALTER TABLE consultations ADD COLUMN call_connected_at timestamptz;
  END IF;
END $$;

-- Create index for call status lookups
CREATE INDEX IF NOT EXISTS idx_consultations_call_status ON consultations(call_status);
