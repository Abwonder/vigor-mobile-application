/*
  # Add Patient Cancel Request Policy
  
  This migration adds a policy to allow patients to cancel their own sponsorship requests.
  
  ## Why This Is Needed
  
  - Patients may want to cancel a pending request they sent
  - Current policies only allow sponsors to update (accept/decline) requests
  - Patients need to be able to update their own requests to cancelled status
  
  ## Changes Made
  
  1. Add policy for patients to update their own requests
  
  ## Security
  
  - Only the patient who created the request can update it
  - Patients can only modify their own requests
*/

-- Allow patients to cancel their own requests
CREATE POLICY "Patients can cancel own requests"
  ON sponsorship_requests FOR UPDATE
  TO authenticated
  USING (auth.uid() = patient_user_id)
  WITH CHECK (auth.uid() = patient_user_id);
