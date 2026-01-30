/*
  # Update User Symptoms for Cart System (v2)

  ## Overview
  Updates the user_symptoms table to support the cart-style symptom selection system
  where users can select multiple symptoms including custom symptoms.

  ## Changes

  ### `user_symptoms` table updates
  - Drop foreign key constraint on symptom_id (to allow custom symptoms)
  - Change `symptom_id` from uuid to text
  - Add `is_custom` boolean column

  ### `triage_sessions` table updates
  - Add `all_symptoms` jsonb column to store array of all selected symptom names

  ## Notes
  - Removes foreign key constraint since we support custom symptoms
  - Preserves existing data
*/

-- Update user_symptoms table
DO $$
BEGIN
  -- Drop the foreign key constraint if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'user_symptoms_symptom_id_fkey'
    AND table_name = 'user_symptoms'
  ) THEN
    ALTER TABLE user_symptoms DROP CONSTRAINT user_symptoms_symptom_id_fkey;
  END IF;

  -- Change symptom_id from uuid to text
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_symptoms' 
    AND column_name = 'symptom_id' 
    AND data_type = 'uuid'
  ) THEN
    ALTER TABLE user_symptoms ALTER COLUMN symptom_id TYPE text USING symptom_id::text;
  END IF;

  -- Add is_custom column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_symptoms' AND column_name = 'is_custom'
  ) THEN
    ALTER TABLE user_symptoms ADD COLUMN is_custom boolean DEFAULT false;
  END IF;
END $$;

-- Add all_symptoms column to triage_sessions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'triage_sessions' AND column_name = 'all_symptoms'
  ) THEN
    ALTER TABLE triage_sessions ADD COLUMN all_symptoms jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;
