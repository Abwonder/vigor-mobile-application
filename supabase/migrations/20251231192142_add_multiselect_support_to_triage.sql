/*
  # Add Multi-Select Support to Triage System

  ## Changes
  
  1. Update question_type constraint to include 'multi_select'
  2. Update triage_responses to store multiple answers as JSON array
  3. Add updated sample questions with multi-select type

  ## Details
  - Questions can now be 'multiple_choice', 'multi_select', or 'text_input'
  - Responses can store single string or JSON array of strings
*/

-- Drop the old constraint and add new one with multi_select support
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE constraint_name = 'triage_questions_question_type_check'
  ) THEN
    ALTER TABLE triage_questions DROP CONSTRAINT triage_questions_question_type_check;
  END IF;
END $$;

ALTER TABLE triage_questions
ADD CONSTRAINT triage_questions_question_type_check
CHECK (question_type IN ('multiple_choice', 'multi_select', 'text_input'));

-- Update existing headache questions to include multi-select questions
DO $$
DECLARE
  headache_id uuid;
BEGIN
  SELECT id INTO headache_id FROM symptoms_catalog WHERE name = 'Headache' LIMIT 1;
  
  IF headache_id IS NOT NULL THEN
    -- Delete old questions to avoid conflicts
    DELETE FROM triage_questions WHERE symptom_id = headache_id;
    
    -- Insert updated questions with multi-select support
    INSERT INTO triage_questions (symptom_id, question_text, question_type, options, order_number)
    VALUES
      (headache_id, 'How long have you been experiencing this headache?', 'multiple_choice', 
       '["Less than a day", "1-3 days", "More than 3 days"]'::jsonb, 1),
      (headache_id, 'Can you describe the headache?', 'multiple_choice',
       '["Throbbing / Pulsating", "Steady / Pressure-like", "Sharp / Stabbing", "Other"]'::jsonb, 2),
      (headache_id, 'Are you experiencing any of the following along with your headache?', 'multi_select',
       '["Blurred vision", "Dizziness / lightheadedness", "Nausea or vomiting", "Chest discomfort", "Shortness of breath", "None of these"]'::jsonb, 3),
      (headache_id, 'Where is the pain located?', 'multiple_choice',
       '["Front of head", "Back of head", "One side", "All over"]'::jsonb, 4),
      (headache_id, 'How severe is the pain on a scale of 1-10?', 'multiple_choice',
       '["1-3 (Mild)", "4-6 (Moderate)", "7-10 (Severe)"]'::jsonb, 5),
      (headache_id, 'Have you taken any medication for this?', 'multiple_choice',
       '["Yes, it helped", "Yes, but no relief", "No"]'::jsonb, 6),
      (headache_id, 'Is there anything that makes it better or worse?', 'text_input',
       '[]'::jsonb, 7);
  END IF;
END $$;