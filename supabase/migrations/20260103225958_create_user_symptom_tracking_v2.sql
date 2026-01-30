/*
  # User Symptom Tracking System
  
  1. New Table
    - `user_symptom_interactions` - Tracks every time a user searches or starts triage for a symptom
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `symptom_name` (text) - The symptom they interacted with
      - `interaction_type` (text) - 'search' or 'triage_start'
      - `created_at` (timestamptz)
      
  2. Purpose
    - Learn user behavior to personalize common conditions
    - Track which symptoms users interact with most
    - Enable personalized health recommendations
    
  3. Security
    - Enable RLS
    - Users can only insert their own interactions
    - Users can only read their own interactions
*/

-- Create user symptom tracking table
CREATE TABLE IF NOT EXISTS user_symptom_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  symptom_name text NOT NULL,
  interaction_type text NOT NULL CHECK (interaction_type IN ('search', 'triage_start', 'view')),
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_symptom_interactions_user_id 
  ON user_symptom_interactions(user_id);
  
CREATE INDEX IF NOT EXISTS idx_user_symptom_interactions_created_at 
  ON user_symptom_interactions(created_at DESC);

-- Enable RLS
ALTER TABLE user_symptom_interactions ENABLE ROW LEVEL SECURITY;

-- Users can insert their own interactions
CREATE POLICY "Users can log their own symptom interactions"
  ON user_symptom_interactions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can view their own interactions
CREATE POLICY "Users can view their own symptom interactions"
  ON user_symptom_interactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create a function to get user's most common conditions
CREATE OR REPLACE FUNCTION get_user_common_conditions(p_user_id uuid, p_limit int DEFAULT 6)
RETURNS TABLE (
  symptom_name text,
  interaction_count bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    usi.symptom_name,
    COUNT(*) as interaction_count
  FROM user_symptom_interactions usi
  WHERE usi.user_id = p_user_id
    AND usi.created_at > NOW() - INTERVAL '90 days'
  GROUP BY usi.symptom_name
  ORDER BY interaction_count DESC, MAX(usi.created_at) DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get global popular conditions (fallback for new users)
CREATE OR REPLACE FUNCTION get_global_common_conditions(p_limit int DEFAULT 6)
RETURNS TABLE (
  symptom_name text
) AS $$
BEGIN
  -- Return hardcoded common conditions for new users
  RETURN QUERY
  SELECT unnest(ARRAY['Fever', 'Headache', 'Cough', 'Stomach pain / cramps', 'Body aches', 'Common cold / flu'])::text
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;