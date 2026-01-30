/*
  # Remove Payment Plans from Symptoms

  ## Overview
  Removes payment plan and pricing information from symptoms catalog.
  All symptoms are now available to all users without payment restrictions.

  ## Changes
  - Set all coverage_plan values to NULL
  - Set all direct_price_min values to NULL
  - Set all direct_price_max values to NULL

  ## Notes
  - Columns are kept in database for backward compatibility
  - Can be dropped in future migration if needed
*/

-- Clear all payment plan data from symptoms
UPDATE symptoms_catalog
SET 
  coverage_plan = NULL,
  direct_price_min = NULL,
  direct_price_max = NULL
WHERE coverage_plan IS NOT NULL 
   OR direct_price_min IS NOT NULL 
   OR direct_price_max IS NOT NULL;
