/*
  # Add Risk Weights to Triage Questions

  ## Description
  Adds risk_weights column to triage_questions table to support AI-generated
  risk scoring. Each answer option can have an associated risk weight (0-5)
  that contributes to the overall severity assessment.

  ## Changes
  
  1. Add risk_weights column (JSONB)
     - Stores mapping of answer options to risk scores
     - Example: {"Severe": 5, "Moderate": 3, "Mild": 1}
  
  2. Add metadata column for storing AI generation info
     - Tracks when questions were AI-generated
     - Stores model version, generation timestamp

  ## Example Risk Weights

  For a severity question:
  {
    "Severe": 5,
    "Moderate": 3,
    "Mild": 1
  }

  For a yes/no question about dangerous symptoms:
  {
    "Yes": 5,
    "No": 0
  }

  For multi-select dangerous symptoms:
  {
    "Chest pain": 5,
    "Shortness of breath": 5,
    "Dizziness": 3,
    "Headache": 2,
    "None of these": 0
  }
*/

-- Add risk_weights column to triage_questions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'triage_questions' AND column_name = 'risk_weights'
  ) THEN
    ALTER TABLE triage_questions ADD COLUMN risk_weights jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Add metadata column for AI generation tracking
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'triage_questions' AND column_name = 'metadata'
  ) THEN
    ALTER TABLE triage_questions ADD COLUMN metadata jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Update existing headache questions with risk weights
DO $$
DECLARE
  headache_id uuid;
  q1_id uuid;
  q2_id uuid;
  q3_id uuid;
  q4_id uuid;
  q5_id uuid;
  q6_id uuid;
  q7_id uuid;
BEGIN
  -- Get headache symptom ID
  SELECT id INTO headache_id FROM symptoms_catalog WHERE name = 'Headache' LIMIT 1;
  
  IF headache_id IS NOT NULL THEN
    -- Get question IDs
    SELECT id INTO q1_id FROM triage_questions WHERE symptom_id = headache_id AND order_number = 1;
    SELECT id INTO q2_id FROM triage_questions WHERE symptom_id = headache_id AND order_number = 2;
    SELECT id INTO q3_id FROM triage_questions WHERE symptom_id = headache_id AND order_number = 3;
    SELECT id INTO q4_id FROM triage_questions WHERE symptom_id = headache_id AND order_number = 4;
    SELECT id INTO q5_id FROM triage_questions WHERE symptom_id = headache_id AND order_number = 5;
    SELECT id INTO q6_id FROM triage_questions WHERE symptom_id = headache_id AND order_number = 6;
    SELECT id INTO q7_id FROM triage_questions WHERE symptom_id = headache_id AND order_number = 7;

    -- Update Question 1: Blood pressure history
    IF q1_id IS NOT NULL THEN
      UPDATE triage_questions
      SET risk_weights = '{"Yes": 2, "No": 0, "Not sure": 1}'::jsonb
      WHERE id = q1_id;
    END IF;

    -- Update Question 2: Blood pressure medication
    IF q2_id IS NOT NULL THEN
      UPDATE triage_questions
      SET risk_weights = '{"Yes": 1, "No": 0}'::jsonb
      WHERE id = q2_id;
    END IF;

    -- Update Question 3: Associated symptoms (multi-select)
    IF q3_id IS NOT NULL THEN
      UPDATE triage_questions
      SET risk_weights = '{
        "Blurred vision": 3,
        "Dizziness / lightheadedness": 3,
        "Nausea or vomiting": 2,
        "Chest discomfort": 5,
        "Shortness of breath": 5,
        "None of these": 0
      }'::jsonb
      WHERE id = q3_id;
    END IF;

    -- Update Question 4: Location
    IF q4_id IS NOT NULL THEN
      UPDATE triage_questions
      SET risk_weights = '{"Front of head": 1, "Back of head": 1, "One side": 2, "All over": 1}'::jsonb
      WHERE id = q4_id;
    END IF;

    -- Update Question 5: Severity
    IF q5_id IS NOT NULL THEN
      UPDATE triage_questions
      SET risk_weights = '{"Mild": 1, "Moderate": 3, "Severe": 5}'::jsonb
      WHERE id = q5_id;
    END IF;

    -- Update Question 6: Medication effectiveness
    IF q6_id IS NOT NULL THEN
      UPDATE triage_questions
      SET risk_weights = '{"Yes, it helped": 0, "Yes, but no relief": 2, "No": 1}'::jsonb
      WHERE id = q6_id;
    END IF;

    -- Update Question 7: Worst headache ever
    IF q7_id IS NOT NULL THEN
      UPDATE triage_questions
      SET risk_weights = '{"Yes": 5, "No": 0}'::jsonb
      WHERE id = q7_id;
    END IF;
  END IF;
END $$;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_triage_questions_risk_weights ON triage_questions USING GIN (risk_weights);
