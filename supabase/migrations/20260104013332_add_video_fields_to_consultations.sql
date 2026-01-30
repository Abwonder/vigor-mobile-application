/*
  # Add Video Call Fields to Consultations

  ## Overview
  Extends the consultations table with fields to support video consultations using Twilio Video.

  ## Changes
  
  ### Modified Tables
  - `consultations` table - Added video-related columns:
    - `video_room_id` (text) - Twilio video room identifier
    - `video_started_at` (timestamptz) - When video call started
    - `video_ended_at` (timestamptz) - When video call ended
    - `call_duration_minutes` (integer) - Total call duration in minutes
    - `call_recording_url` (text) - Optional URL to call recording
    - `call_type` (text) - Type of call: 'video', 'audio_only', or null for chat-only
  
  ## Notes
  - All video fields are nullable to maintain backward compatibility
  - Call duration is automatically calculated when video_ended_at is set
  - Call type defaults to null for existing consultations (chat-only)
*/

-- Add video-related fields to consultations table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'consultations' AND column_name = 'video_room_id'
  ) THEN
    ALTER TABLE consultations ADD COLUMN video_room_id text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'consultations' AND column_name = 'video_started_at'
  ) THEN
    ALTER TABLE consultations ADD COLUMN video_started_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'consultations' AND column_name = 'video_ended_at'
  ) THEN
    ALTER TABLE consultations ADD COLUMN video_ended_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'consultations' AND column_name = 'call_duration_minutes'
  ) THEN
    ALTER TABLE consultations ADD COLUMN call_duration_minutes integer;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'consultations' AND column_name = 'call_recording_url'
  ) THEN
    ALTER TABLE consultations ADD COLUMN call_recording_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'consultations' AND column_name = 'call_type'
  ) THEN
    ALTER TABLE consultations ADD COLUMN call_type text CHECK (call_type IN ('video', 'audio_only'));
  END IF;
END $$;

-- Create index for video room lookups
CREATE INDEX IF NOT EXISTS idx_consultations_video_room ON consultations(video_room_id);

-- Function to calculate call duration when video ends
CREATE OR REPLACE FUNCTION calculate_call_duration()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate duration in minutes if both start and end times are set
  IF NEW.video_started_at IS NOT NULL AND NEW.video_ended_at IS NOT NULL THEN
    NEW.call_duration_minutes = EXTRACT(EPOCH FROM (NEW.video_ended_at - NEW.video_started_at)) / 60;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-calculate call duration
DROP TRIGGER IF EXISTS on_consultation_video_ended ON consultations;
CREATE TRIGGER on_consultation_video_ended
  BEFORE UPDATE ON consultations
  FOR EACH ROW
  WHEN (NEW.video_ended_at IS NOT NULL AND OLD.video_ended_at IS NULL)
  EXECUTE FUNCTION calculate_call_duration();
