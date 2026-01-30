/*
  # Fix Sponsor ID Generation and Table Synchronization
  
  This migration fixes critical issues in the sponsor workflow:
  
  ## Issues Fixed
  
  1. Auto-create sponsor records in `sponsors` table when user selects sponsor role
  2. Ensure consistency between user_profiles.sponsor_code and sponsors.reference_id
  3. Add missing trigger to populate sponsors table automatically
  
  ## Changes Made
  
  1. New Function
    - `create_sponsor_record_if_needed()` - Creates sponsor table entry when role changes to sponsor
  
  2. New Trigger
    - Automatically creates sponsor record when user becomes a sponsor
  
  3. Updates
    - Ensure sponsor_code in user_profiles matches reference_id in sponsors table
*/

-- Function to create sponsor record when user becomes a sponsor
CREATE OR REPLACE FUNCTION create_sponsor_record_if_needed()
RETURNS TRIGGER AS $$
DECLARE
  sponsor_ref_id text;
  user_full_name text;
  user_email text;
  user_phone text;
BEGIN
  -- If user is being set as sponsor role and doesn't have a sponsor record
  IF NEW.role = 'sponsor' AND NOT EXISTS (
    SELECT 1 FROM sponsors WHERE user_id = NEW.id
  ) THEN
    -- Get user details
    SELECT 
      COALESCE(NEW.first_name || ' ' || NEW.last_name, 'Sponsor User'),
      NEW.email,
      NEW.phone_number
    INTO user_full_name, user_email, user_phone;
    
    -- Use the sponsor_code from user_profiles if it exists, otherwise generate new one
    IF NEW.sponsor_code IS NOT NULL AND NEW.sponsor_code != '' THEN
      sponsor_ref_id := NEW.sponsor_code;
    ELSE
      sponsor_ref_id := generate_unique_sponsor_code();
      NEW.sponsor_code := sponsor_ref_id;
    END IF;
    
    -- Create sponsor record
    INSERT INTO sponsors (
      user_id, 
      reference_id, 
      full_name, 
      email, 
      phone_number,
      active,
      total_patients,
      active_patients
    ) VALUES (
      NEW.id,
      sponsor_ref_id,
      user_full_name,
      user_email,
      user_phone,
      true,
      0,
      0
    )
    ON CONFLICT (user_id) DO UPDATE
    SET 
      reference_id = EXCLUDED.reference_id,
      full_name = EXCLUDED.full_name,
      email = EXCLUDED.email,
      phone_number = EXCLUDED.phone_number,
      updated_at = now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists and create new one
DROP TRIGGER IF EXISTS trigger_create_sponsor_record ON user_profiles;
CREATE TRIGGER trigger_create_sponsor_record
  BEFORE INSERT OR UPDATE OF role ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_sponsor_record_if_needed();

-- Function to sync existing sponsor users
CREATE OR REPLACE FUNCTION sync_existing_sponsor_users()
RETURNS void AS $$
DECLARE
  user_record RECORD;
  sponsor_ref_id text;
BEGIN
  FOR user_record IN 
    SELECT id, first_name, last_name, email, phone_number, sponsor_code
    FROM user_profiles 
    WHERE role = 'sponsor'
  LOOP
    -- Check if sponsor record exists
    IF NOT EXISTS (SELECT 1 FROM sponsors WHERE user_id = user_record.id) THEN
      -- Use existing sponsor_code or generate new one
      IF user_record.sponsor_code IS NOT NULL AND user_record.sponsor_code != '' THEN
        sponsor_ref_id := user_record.sponsor_code;
      ELSE
        sponsor_ref_id := generate_unique_sponsor_code();
        
        -- Update user_profiles with new code
        UPDATE user_profiles 
        SET sponsor_code = sponsor_ref_id 
        WHERE id = user_record.id;
      END IF;
      
      -- Create sponsor record
      INSERT INTO sponsors (
        user_id, 
        reference_id, 
        full_name, 
        email, 
        phone_number,
        active,
        total_patients,
        active_patients
      ) VALUES (
        user_record.id,
        sponsor_ref_id,
        COALESCE(user_record.first_name || ' ' || user_record.last_name, 'Sponsor User'),
        user_record.email,
        user_record.phone_number,
        true,
        0,
        0
      )
      ON CONFLICT (user_id) DO NOTHING;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Run sync for existing users
SELECT sync_existing_sponsor_users();

-- Drop the sync function as it's no longer needed after initial run
DROP FUNCTION sync_existing_sponsor_users();
