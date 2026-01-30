/*
  # Add Hybrid Triage System Tracking

  ## Overview
  This migration adds tracking capabilities for the hybrid triage system that combines
  pre-generated questions with real-time AI generation.

  ## Changes

  1. **symptoms_catalog table**
     - Add `questions_generated` (boolean) - tracks if questions have been pre-generated
     - Add `generation_source` (text) - tracks how questions were generated (ai_realtime, pre_generated, manual)
     - Add `last_generated_at` (timestamptz) - when questions were last generated/updated
     - Add `usage_count` (integer) - how many times this symptom has been triaged (for analytics)

  2. **triage_questions table**
     - Add `generation_source` (text) - tracks if this question was AI-generated or manually created
     - Add `generated_at` (timestamptz) - when this question was generated

  3. **triage_sessions table**
     - Add `assessment_method` (text) - tracks if final assessment was rule_based or ai_powered
     - Add `risk_score` (integer) - stores the calculated risk score
     - Add `processing_time_ms` (integer) - tracks performance metrics

  4. **Create analytics view**
     - View to track hybrid system performance and cost efficiency

  ## Notes
  - Supports auto-learning: AI generates questions for new symptoms, then caches them
  - Enables A/B testing between rule-based and AI assessment
  - Tracks cost efficiency (95% should be rule-based/cached)
*/

-- Add tracking fields to symptoms_catalog
ALTER TABLE symptoms_catalog 
  ADD COLUMN IF NOT EXISTS questions_generated boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS generation_source text CHECK (generation_source IN ('ai_realtime', 'pre_generated', 'manual', 'not_generated')),
  ADD COLUMN IF NOT EXISTS last_generated_at timestamptz,
  ADD COLUMN IF NOT EXISTS usage_count integer DEFAULT 0;

-- Add tracking fields to triage_questions
ALTER TABLE triage_questions
  ADD COLUMN IF NOT EXISTS generation_source text DEFAULT 'manual' CHECK (generation_source IN ('ai_realtime', 'pre_generated', 'manual')),
  ADD COLUMN IF NOT EXISTS generated_at timestamptz DEFAULT now();

-- Add assessment tracking to triage_sessions
ALTER TABLE triage_sessions
  ADD COLUMN IF NOT EXISTS assessment_method text CHECK (assessment_method IN ('rule_based', 'ai_powered', 'hybrid')),
  ADD COLUMN IF NOT EXISTS risk_score integer,
  ADD COLUMN IF NOT EXISTS processing_time_ms integer;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_symptoms_questions_generated ON symptoms_catalog(questions_generated);
CREATE INDEX IF NOT EXISTS idx_symptoms_usage_count ON symptoms_catalog(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_triage_sessions_assessment ON triage_sessions(assessment_method);

-- Create analytics view for hybrid system performance
CREATE OR REPLACE VIEW triage_analytics AS
SELECT 
  DATE_TRUNC('day', ts.started_at) as date,
  COUNT(*) as total_triages,
  COUNT(*) FILTER (WHERE ts.assessment_method = 'rule_based') as rule_based_count,
  COUNT(*) FILTER (WHERE ts.assessment_method = 'ai_powered') as ai_powered_count,
  COUNT(*) FILTER (WHERE ts.assessment_method = 'hybrid') as hybrid_count,
  ROUND(AVG(ts.processing_time_ms)) as avg_processing_time_ms,
  ROUND(AVG(ts.risk_score)) as avg_risk_score
FROM triage_sessions ts
WHERE ts.started_at IS NOT NULL
GROUP BY DATE_TRUNC('day', ts.started_at)
ORDER BY date DESC;

-- Update existing Headache symptom to mark as pre-generated
UPDATE symptoms_catalog
SET 
  questions_generated = true,
  generation_source = 'pre_generated',
  last_generated_at = now()
WHERE name = 'Headache';

-- Update existing headache questions to mark as pre-generated
UPDATE triage_questions
SET 
  generation_source = 'pre_generated',
  generated_at = now()
WHERE symptom_id = (SELECT id FROM symptoms_catalog WHERE name = 'Headache');

-- Create function to increment symptom usage count
CREATE OR REPLACE FUNCTION increment_symptom_usage()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE symptoms_catalog
  SET usage_count = usage_count + 1
  WHERE id = (
    SELECT symptom_id 
    FROM triage_questions 
    WHERE id = NEW.question_id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to track symptom usage
DROP TRIGGER IF EXISTS trigger_increment_symptom_usage ON triage_responses;
CREATE TRIGGER trigger_increment_symptom_usage
AFTER INSERT ON triage_responses
FOR EACH ROW
EXECUTE FUNCTION increment_symptom_usage();
