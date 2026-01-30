/*
  # Fix Sponsorships RLS Policies
  
  This migration fixes incorrect RLS policies on the sponsorships table.
  
  ## Issues Fixed
  
  1. The RLS policies were checking sponsor_id against sponsors.id (UUID from sponsors table)
  2. But sponsorships.sponsor_id is actually a direct reference to auth.users(id)
  3. This prevented sponsors from viewing/updating their sponsorships
  
  ## Changes Made
  
  1. Drop incorrect policies
  2. Create correct policies that directly compare with auth.uid()
*/

-- Drop incorrect policies
DROP POLICY IF EXISTS "Sponsors can view their sponsorships" ON sponsorships;
DROP POLICY IF EXISTS "Sponsors can update their sponsorships" ON sponsorships;
DROP POLICY IF EXISTS "System can create sponsorships" ON sponsorships;

-- Create correct policies
CREATE POLICY "Sponsors can view their sponsorships"
  ON sponsorships FOR SELECT
  TO authenticated
  USING (auth.uid() = sponsor_id);

CREATE POLICY "Sponsors can update their sponsorships"
  ON sponsorships FOR UPDATE
  TO authenticated
  USING (auth.uid() = sponsor_id)
  WITH CHECK (auth.uid() = sponsor_id);

CREATE POLICY "Sponsors can create sponsorships"
  ON sponsorships FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sponsor_id);
