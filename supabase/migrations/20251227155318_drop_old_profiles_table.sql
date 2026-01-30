/*
  # Drop old profiles table
  
  1. Purpose
    - Remove the duplicate `profiles` table
    - Keep only `user_profiles` table which is currently in use
    
  2. Changes
    - Drop the profiles table and its associated trigger/function
*/

-- Drop the old profiles table
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop the old trigger and function if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
