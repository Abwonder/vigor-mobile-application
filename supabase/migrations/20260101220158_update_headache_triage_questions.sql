/*
  # Update Headache Triage Questions

  ## Description
  Updates triage questions for headache symptom to match the exact flow shown in designs.
  
  ## Questions (7 total)
  1. Do you have a history of high blood pressure? (Yes/No)
  2. Are you taking any blood pressure medication? (Yes/No)
  3. Are you experiencing any of the following along with your headache? (multi-select)
  4. How severe is your headache? (Mild/Moderate/Severe)
  5. When did this headache start? (time-based options)
  6. Have you recently consumed a lot of salt, caffeine, or alcohol? (Yes/No)
  7. Are your symptoms severe or sudden, like the worst headache ever? (Yes/No)
*/

DO $$
DECLARE
  headache_id uuid;
BEGIN
  -- Get headache symptom ID
  SELECT id INTO headache_id FROM symptoms_catalog WHERE name = 'Headache' LIMIT 1;
  
  IF headache_id IS NOT NULL THEN
    -- Delete existing questions
    DELETE FROM triage_questions WHERE symptom_id = headache_id;
    
    -- Insert updated questions matching the design
    INSERT INTO triage_questions (symptom_id, question_text, question_type, options, order_number)
    VALUES
      (headache_id, 'Do you have a history of high blood pressure?', 'multiple_choice', 
       '["Yes", "No", "Not sure"]'::jsonb, 1),
      (headache_id, 'Are you taking any blood pressure medication?', 'multiple_choice',
       '["Yes", "No"]'::jsonb, 2),
      (headache_id, 'Are you experiencing any of the following along with your headache?', 'multi_select',
       '["Blurred vision", "Dizziness / lightheadedness", "Nausea or vomiting", "Chest discomfort", "Shortness of breath", "None of these"]'::jsonb, 3),
      (headache_id, 'How severe is your headache?', 'multiple_choice',
       '["Mild", "Moderate", "Severe"]'::jsonb, 4),
      (headache_id, 'When did this headache start?', 'multiple_choice',
       '["Within the last hour", "1-6 hours ago", "More than 6 hours ago"]'::jsonb, 5),
      (headache_id, 'Have you recently consumed a lot of salt, caffeine, or alcohol?', 'multiple_choice',
       '["Yes", "No"]'::jsonb, 6),
      (headache_id, 'Are your symptoms severe or sudden, like the worst headache ever?', 'multiple_choice',
       '["Yes", "No"]'::jsonb, 7);
  END IF;
END $$;
