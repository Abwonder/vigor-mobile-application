/*
  # Create Nurses Table

  ## Description
  Creates a table to manage health nurses who assist patients during triage sessions.
  Each nurse has a name, profile image, title, and active status.
  Only one nurse should be active at a time (managed by admin dashboard).

  ## Tables Created
  
  1. **nurses**
    - `id` (uuid, primary key) - Unique identifier for each nurse
    - `name` (text, required) - Full name of the nurse
    - `title` (text, optional) - Job title (e.g., "Public health nurse")
    - `profile_image_url` (text, optional) - URL to nurse's profile photo
    - `is_active` (boolean, default false) - Whether this nurse is currently online/active
    - `created_at` (timestamptz, default now()) - Record creation timestamp
    - `updated_at` (timestamptz, default now()) - Last update timestamp

  ## Security
  - Enable RLS on nurses table
  - Allow all authenticated users to view nurses (read-only)
  - Only service role can insert/update/delete nurses (admin dashboard)

  ## Sample Data
  - Adds sample nurses including Sophia (active), Emma, and Michael
*/

-- Create nurses table
CREATE TABLE IF NOT EXISTS nurses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  title text DEFAULT 'Public health nurse',
  profile_image_url text,
  is_active boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE nurses ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view nurses
CREATE POLICY "Authenticated users can view nurses"
  ON nurses
  FOR SELECT
  TO authenticated
  USING (true);

-- Insert sample nurses (one active)
INSERT INTO nurses (name, title, is_active, profile_image_url)
VALUES
  ('Sophia', 'Public health nurse', true, NULL),
  ('Emma Johnson', 'Public health nurse', false, NULL),
  ('Michael Chen', 'Public health nurse', false, NULL)
ON CONFLICT DO NOTHING;