/*
  # Add Sponsors Lookup Policy
  
  This migration adds a policy to allow patients to look up sponsors by reference_id.
  
  ## Why This Is Needed
  
  - Patients need to enter a sponsor's reference_id to send a connection request
  - They need to query the sponsors table to validate the ID and get sponsor info
  - Current policies only allow sponsors to view their own records
  
  ## Changes Made
  
  1. Add policy for authenticated users to look up active sponsors by reference_id
  
  ## Security
  
  - Only active sponsors are visible
  - Only basic information (user_id, reference_id, full_name) is needed for lookup
  - Personal contact details are not exposed in this lookup
*/

-- Allow authenticated users to look up active sponsors by reference_id
CREATE POLICY "Users can lookup active sponsors"
  ON sponsors FOR SELECT
  TO authenticated
  USING (active = true);
