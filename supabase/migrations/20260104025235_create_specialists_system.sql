/*
  # Create Specialists System

  1. New Tables
    - `specialists`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users) - links to user account
      - `full_name` (text)
      - `specialty` (text) - e.g., "Cardiologist"
      - `photo_url` (text)
      - `about` (text) - biography
      - `years_experience` (integer)
      - `current_position` (text)
      - `professional_memberships` (text[])
      - `next_available` (date)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `specialist_education`
      - `id` (uuid, primary key)
      - `specialist_id` (uuid, references specialists)
      - `degree` (text) - e.g., "MBBS"
      - `institution` (text)
      - `year` (integer)
      - `order_index` (integer) - for display ordering
      - `created_at` (timestamptz)
    
    - `specialist_expertise`
      - `id` (uuid, primary key)
      - `specialist_id` (uuid, references specialists)
      - `area` (text) - e.g., "Hypertension & heart failure"
      - `order_index` (integer)
      - `created_at` (timestamptz)
    
    - `specialist_languages`
      - `id` (uuid, primary key)
      - `specialist_id` (uuid, references specialists)
      - `language` (text)
      - `order_index` (integer)
      - `created_at` (timestamptz)
    
    - `specialist_reviews`
      - `id` (uuid, primary key)
      - `specialist_id` (uuid, references specialists)
      - `reviewer_name` (text)
      - `rating` (integer) - 1-5 stars
      - `review_text` (text)
      - `created_at` (timestamptz)
    
    - `specialist_availability`
      - `id` (uuid, primary key)
      - `specialist_id` (uuid, references specialists)
      - `available_date` (date)
      - `is_available` (boolean)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Authenticated users can read specialist information
    - Only specialists can update their own profiles
*/

-- Create specialists table
CREATE TABLE IF NOT EXISTS specialists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  specialty text NOT NULL,
  photo_url text,
  about text,
  years_experience integer DEFAULT 0,
  current_position text,
  professional_memberships text[],
  next_available date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create specialist_education table
CREATE TABLE IF NOT EXISTS specialist_education (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  specialist_id uuid REFERENCES specialists(id) ON DELETE CASCADE NOT NULL,
  degree text NOT NULL,
  institution text NOT NULL,
  year integer,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create specialist_expertise table
CREATE TABLE IF NOT EXISTS specialist_expertise (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  specialist_id uuid REFERENCES specialists(id) ON DELETE CASCADE NOT NULL,
  area text NOT NULL,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create specialist_languages table
CREATE TABLE IF NOT EXISTS specialist_languages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  specialist_id uuid REFERENCES specialists(id) ON DELETE CASCADE NOT NULL,
  language text NOT NULL,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create specialist_reviews table
CREATE TABLE IF NOT EXISTS specialist_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  specialist_id uuid REFERENCES specialists(id) ON DELETE CASCADE NOT NULL,
  reviewer_name text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create specialist_availability table
CREATE TABLE IF NOT EXISTS specialist_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  specialist_id uuid REFERENCES specialists(id) ON DELETE CASCADE NOT NULL,
  available_date date NOT NULL,
  is_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(specialist_id, available_date)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_specialists_user_id ON specialists(user_id);
CREATE INDEX IF NOT EXISTS idx_specialist_education_specialist_id ON specialist_education(specialist_id);
CREATE INDEX IF NOT EXISTS idx_specialist_expertise_specialist_id ON specialist_expertise(specialist_id);
CREATE INDEX IF NOT EXISTS idx_specialist_languages_specialist_id ON specialist_languages(specialist_id);
CREATE INDEX IF NOT EXISTS idx_specialist_reviews_specialist_id ON specialist_reviews(specialist_id);
CREATE INDEX IF NOT EXISTS idx_specialist_availability_specialist_id ON specialist_availability(specialist_id);
CREATE INDEX IF NOT EXISTS idx_specialist_availability_date ON specialist_availability(available_date);

-- Enable RLS
ALTER TABLE specialists ENABLE ROW LEVEL SECURITY;
ALTER TABLE specialist_education ENABLE ROW LEVEL SECURITY;
ALTER TABLE specialist_expertise ENABLE ROW LEVEL SECURITY;
ALTER TABLE specialist_languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE specialist_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE specialist_availability ENABLE ROW LEVEL SECURITY;

-- RLS Policies for specialists
CREATE POLICY "Anyone can view specialists"
  ON specialists FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Specialists can update own profile"
  ON specialists FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for specialist_education
CREATE POLICY "Anyone can view specialist education"
  ON specialist_education FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Specialists can manage own education"
  ON specialist_education FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM specialists
      WHERE specialists.id = specialist_education.specialist_id
      AND specialists.user_id = auth.uid()
    )
  );

-- RLS Policies for specialist_expertise
CREATE POLICY "Anyone can view specialist expertise"
  ON specialist_expertise FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Specialists can manage own expertise"
  ON specialist_expertise FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM specialists
      WHERE specialists.id = specialist_expertise.specialist_id
      AND specialists.user_id = auth.uid()
    )
  );

-- RLS Policies for specialist_languages
CREATE POLICY "Anyone can view specialist languages"
  ON specialist_languages FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Specialists can manage own languages"
  ON specialist_languages FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM specialists
      WHERE specialists.id = specialist_languages.specialist_id
      AND specialists.user_id = auth.uid()
    )
  );

-- RLS Policies for specialist_reviews
CREATE POLICY "Anyone can view specialist reviews"
  ON specialist_reviews FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create reviews"
  ON specialist_reviews FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for specialist_availability
CREATE POLICY "Anyone can view specialist availability"
  ON specialist_availability FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Specialists can manage own availability"
  ON specialist_availability FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM specialists
      WHERE specialists.id = specialist_availability.specialist_id
      AND specialists.user_id = auth.uid()
    )
  );