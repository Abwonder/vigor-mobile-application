/*
  # Allow Anonymous Access to Symptoms Catalog

  ## Overview
  Allow anonymous users to read from symptoms_catalog table.
  This is needed for:
  - Pre-generation script to work
  - Public symptom search/browsing
  - Unauthenticated users to see available symptoms

  ## Changes
  1. Add RLS policy for anonymous SELECT on symptoms_catalog
  2. Add RLS policy for anonymous SELECT on triage_questions (needed for cached questions)

  ## Security Notes
  - Symptoms catalog is public medical information
  - No sensitive data is exposed
  - Users still need authentication to create triage sessions or submit responses
*/

-- Allow anonymous users to read symptoms catalog
CREATE POLICY "Anonymous users can view symptoms catalog"
  ON symptoms_catalog
  FOR SELECT
  TO anon
  USING (true);

-- Allow anonymous users to read triage questions (for cached questions)
CREATE POLICY "Anonymous users can view triage questions"
  ON triage_questions
  FOR SELECT
  TO anon
  USING (true);
