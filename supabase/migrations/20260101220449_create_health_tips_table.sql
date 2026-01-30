/*
  # Create Health Tips Table

  ## Description
  Creates a table to store health tips that are shown during triage waiting periods.
  Tips are symptom-specific and rotate automatically every few seconds.

  ## New Table
  
  ### `health_tips`
  - `id` (uuid, primary key) - Unique tip identifier
  - `symptom_category` (text) - Category of symptom (e.g., 'Headache', 'General', 'All')
  - `title` (text, required) - Tip title (e.g., "Stay Hydrated")
  - `description` (text, required) - Detailed tip description
  - `icon_name` (text) - Name of icon to display (e.g., 'lightbulb', 'water', 'rest')
  - `order_number` (int) - Display order for tips
  - `is_active` (boolean, default true) - Whether tip is currently active
  - `created_at` (timestamptz) - When tip was created

  ## Security
  - Enable RLS on health_tips table
  - All authenticated users can view active tips

  ## Sample Data
  - Adds general health tips applicable to all symptoms
  - Adds specific tips for common symptoms like headaches
*/

CREATE TABLE IF NOT EXISTS health_tips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symptom_category text DEFAULT 'All',
  title text NOT NULL,
  description text NOT NULL,
  icon_name text DEFAULT 'lightbulb',
  order_number int DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE health_tips ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view active tips
CREATE POLICY "Authenticated users can view active health tips"
  ON health_tips
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_health_tips_category ON health_tips(symptom_category, is_active, order_number);

-- Insert sample health tips
INSERT INTO health_tips (symptom_category, title, description, icon_name, order_number)
VALUES
  ('Headache', 'Stay Hydrated', 'Drink a glass of water. Dehydration can sometimes make headaches worse.', 'droplet', 1),
  ('Headache', 'Find a Quiet Space', 'Rest in a dark, quiet room. This can help reduce headache symptoms.', 'moon', 2),
  ('Headache', 'Apply Cold Compress', 'Place a cold compress on your forehead for 15 minutes.', 'snowflake', 3),
  ('Headache', 'Practice Deep Breathing', 'Take slow, deep breaths to help relax and reduce stress.', 'wind', 4),
  ('All', 'Stay Calm', 'Take a moment to relax. Your health professional will review your responses shortly.', 'heart', 1),
  ('All', 'Keep Track of Symptoms', 'Note any changes in your symptoms while you wait.', 'clipboard', 2),
  ('All', 'Have Questions Ready', 'Prepare any questions you''d like to ask your health professional.', 'message-circle', 3),
  ('Fever', 'Monitor Your Temperature', 'Keep track of your temperature and note any changes.', 'thermometer', 1),
  ('Fever', 'Stay Cool', 'Remove excess clothing and stay in a cool environment.', 'wind', 2),
  ('Respiratory', 'Breathe Slowly', 'Practice slow, controlled breathing to help manage symptoms.', 'wind', 1),
  ('Respiratory', 'Sit Upright', 'Sitting up can help make breathing easier.', 'user', 2)
ON CONFLICT DO NOTHING;
