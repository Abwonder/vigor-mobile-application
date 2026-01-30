-- =====================================================
-- VIGORCARE: PUBLIC HEALTH PROFESSIONAL (PHP) SCHEMA
-- =====================================================

-- 1. TRIAGE CASES TABLE
-- Manages patient symptom submissions and PHP evaluation
CREATE TABLE IF NOT EXISTS public.triage_cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  php_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  specialist_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Case Details
  symptoms jsonb NOT NULL,
  severity_level text CHECK (severity_level IN ('low', 'medium', 'high', 'emergency')),
  patient_notes text,
  patient_age integer,
  patient_gender text,
  
  -- Status Management
  status text DEFAULT 'pending_php' CHECK (status IN (
    'pending_php',
    'reviewing',
    'advice_given',
    'assigned_to_specialist',
    'specialist_accepted',
    'in_consultation',
    'resolved'
  )),
  
  -- Resolution
  php_advice text,
  resolution_type text CHECK (resolution_type IN ('advice_only', 'specialist_referral')),
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  assigned_at timestamptz,
  resolved_at timestamptz,
  
  -- Geographic tracking
  patient_location jsonb
);

-- Indexes for performance
CREATE INDEX idx_triage_status ON public.triage_cases(status);
CREATE INDEX idx_triage_php ON public.triage_cases(php_id);
CREATE INDEX idx_triage_specialist ON public.triage_cases(specialist_id);
CREATE INDEX idx_triage_created ON public.triage_cases(created_at DESC);
CREATE INDEX idx_triage_location ON public.triage_cases USING gin(patient_location);

-- RLS Policies
ALTER TABLE public.triage_cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "PHPs can view all triage cases" 
  ON public.triage_cases FOR SELECT 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role = 'public_health'
    )
  );

CREATE POLICY "Specialists can view assigned cases" 
  ON public.triage_cases FOR SELECT 
  TO authenticated 
  USING (specialist_id = auth.uid());

CREATE POLICY "Patients can view own cases" 
  ON public.triage_cases FOR SELECT 
  TO authenticated 
  USING (patient_id = auth.uid());

CREATE POLICY "PHPs can update triage cases" 
  ON public.triage_cases FOR UPDATE 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role = 'public_health'
    )
  );

-- 2. SPONSOR REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.sponsor_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  patient_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  request_type text CHECK (request_type IN ('medical_history', 'case_status', 'consultation_summary')) NOT NULL,
  request_details text,
  
  -- Approval workflow
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved_php', 'approved_admin', 'denied')),
  php_id uuid REFERENCES auth.users(id),
  php_notes text,
  admin_notes text,
  
  created_at timestamptz DEFAULT now(),
  reviewed_at timestamptz
);

CREATE INDEX idx_sponsor_requests_status ON public.sponsor_requests(status);
CREATE INDEX idx_sponsor_requests_php ON public.sponsor_requests(php_id);

ALTER TABLE public.sponsor_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sponsors can view own requests" 
  ON public.sponsor_requests FOR SELECT 
  TO authenticated 
  USING (sponsor_id = auth.uid());

CREATE POLICY "PHPs can view all sponsor requests" 
  ON public.sponsor_requests FOR SELECT 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role = 'public_health'
    )
  );

CREATE POLICY "PHPs can update sponsor requests" 
  ON public.sponsor_requests FOR UPDATE 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role = 'public_health'
    )
  );

-- 3. SYMPTOM CLUSTERS TABLE (for bulk analytics)
CREATE TABLE IF NOT EXISTS public.symptom_clusters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  region jsonb NOT NULL,
  symptom_type text NOT NULL,
  case_count integer DEFAULT 1,
  date_range tstzrange NOT NULL,
  severity_distribution jsonb,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_symptom_clusters_region ON public.symptom_clusters USING gin(region);
CREATE INDEX idx_symptom_clusters_date ON public.symptom_clusters USING gist(date_range);

ALTER TABLE public.symptom_clusters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "PHPs can view symptom clusters" 
  ON public.symptom_clusters FOR SELECT 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role = 'public_health'
    )
  );

-- 4. UPDATE SPECIALISTS TABLE
-- Add online status tracking
ALTER TABLE public.specialists 
  ADD COLUMN IF NOT EXISTS is_online boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS last_seen timestamptz DEFAULT now();

CREATE INDEX idx_specialists_online ON public.specialists(is_online) WHERE is_online = true;

-- 5. FUNCTION: Auto-update symptom clusters
CREATE OR REPLACE FUNCTION update_symptom_clusters()
RETURNS trigger AS $$
BEGIN
  -- Aggregate logic to update symptom_clusters when new triage_case is created
  INSERT INTO public.symptom_clusters (region, symptom_type, case_count, date_range)
  VALUES (
    NEW.patient_location,
    (NEW.symptoms->0->>'type'),
    1,
    tstzrange(date_trunc('day', NEW.created_at), date_trunc('day', NEW.created_at) + interval '1 day')
  )
  ON CONFLICT DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_symptom_clusters
  AFTER INSERT ON public.triage_cases
  FOR EACH ROW
  EXECUTE FUNCTION update_symptom_clusters();
