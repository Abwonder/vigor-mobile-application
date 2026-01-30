/*
  # Fix Sponsorship Request Acceptance Flow
  
  This migration fixes the sponsorship request acceptance to properly create
  sponsorship records when a request is accepted.
  
  ## Issues Fixed
  
  1. The trigger only updated existing sponsorships but didn't create new ones
  2. When a sponsor accepts a request, a sponsorship record should be created
  3. Patient info needs to be stored in the sponsorship record
  
  ## Changes Made
  
  1. Update trigger function to INSERT sponsorship if it doesn't exist
  2. Properly populate all required fields including patient name and email
*/

CREATE OR REPLACE FUNCTION handle_sponsorship_request_acceptance_v2()
RETURNS TRIGGER AS $$
BEGIN
  -- When a request is accepted, create or update the sponsorship relationship
  IF NEW.status = 'accepted' AND OLD.status = 'pending' THEN
    -- Insert or update the sponsorship
    INSERT INTO sponsorships (
      sponsor_id,
      patient_id,
      patient_name,
      patient_email,
      relationship_type,
      status,
      is_paying,
      started_at
    ) VALUES (
      NEW.sponsor_user_id,
      NEW.patient_user_id,
      NEW.patient_name,
      NEW.patient_email,
      'Other',
      'active',
      false,
      now()
    )
    ON CONFLICT (sponsor_id, patient_id) DO UPDATE
    SET 
      status = 'active',
      patient_name = EXCLUDED.patient_name,
      patient_email = EXCLUDED.patient_email,
      updated_at = now();
    
    -- Update sponsor total patients count
    UPDATE sponsors
    SET 
      total_patients = total_patients + 1,
      active_patients = active_patients + 1,
      updated_at = now()
    WHERE user_id = NEW.sponsor_user_id
      AND NOT EXISTS (
        SELECT 1 FROM sponsorships 
        WHERE sponsor_id = NEW.sponsor_user_id 
        AND patient_id = NEW.patient_user_id 
        AND created_at < now() - interval '1 second'
      );
    
    NEW.responded_at := now();
    NEW.updated_at := now();
  END IF;
  
  -- When a request is declined
  IF NEW.status = 'declined' AND OLD.status = 'pending' THEN
    NEW.responded_at := now();
    NEW.updated_at := now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
