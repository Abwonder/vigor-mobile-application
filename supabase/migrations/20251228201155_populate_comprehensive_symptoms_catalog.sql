/*
  # Populate Comprehensive Symptoms Catalog
  
  1. Changes
    - Populate symptoms catalog with all symptoms from app design
    - Set coverage_plan to indicate which plan covers each symptom
    - Set direct payment prices where applicable
  
  2. Coverage Logic
    - "Ultra Care" plan covers most standard conditions
    - Some premium services require direct payment
    - Direct payment prices shown as price range (min-max) in Naira
*/

-- Clear existing symptoms to repopulate with proper data
DELETE FROM symptoms_catalog;

-- Insert General Symptoms
INSERT INTO symptoms_catalog (name, category, common, description, coverage_plan) VALUES
  ('Fever', 'General Symptoms', true, 'Elevated body temperature', 'Ultra Care'),
  ('Fatigue / weakness', 'General Symptoms', false, 'Feeling tired or weak', 'Ultra Care'),
  ('Headache', 'General Symptoms', false, 'Pain in the head or face area', 'Ultra Care'),
  ('Body aches', 'General Symptoms', false, 'Muscle or body pain', 'Ultra Care');

-- Insert Respiratory & Chest Symptoms
INSERT INTO symptoms_catalog (name, category, common, description, coverage_plan) VALUES
  ('Common cold / flu', 'Respiratory & Chest', false, 'Viral respiratory infection', 'Ultra Care'),
  ('Cough', 'Respiratory & Chest', false, 'Persistent coughing', 'Ultra Care'),
  ('Asthma attack (mild–moderate)', 'Respiratory & Chest', false, 'Difficulty breathing due to asthma', 'Ultra Care'),
  ('Chest pain (non-emergency)', 'Respiratory & Chest', false, 'Non-critical chest discomfort', 'Ultra Care'),
  ('Shortness of breath', 'Respiratory & Chest', false, 'Difficulty breathing', 'Ultra Care');

-- Insert Stomach & Digestion Symptoms
INSERT INTO symptoms_catalog (name, category, common, description, coverage_plan) VALUES
  ('Stomach pain / cramps', 'Stomach & Digestion', false, 'Abdominal pain or cramping', 'Ultra Care'),
  ('Diarrhea', 'Stomach & Digestion', false, 'Loose or watery stools', 'Ultra Care'),
  ('Constipation', 'Stomach & Digestion', false, 'Difficulty passing stools', 'Ultra Care'),
  ('Nausea / vomiting', 'Stomach & Digestion', false, 'Feeling sick or throwing up', 'Ultra Care'),
  ('Indigestion / reflux', 'Stomach & Digestion', false, 'Heartburn or acid reflux', 'Ultra Care');

-- Insert Skin & Allergies Symptoms
INSERT INTO symptoms_catalog (name, category, common, description, coverage_plan, direct_price_min, direct_price_max) VALUES
  ('Allergies', 'Skin & Allergies', false, 'Allergic reactions', 'Ultra Care', NULL, NULL),
  ('Skin infection', 'Skin & Allergies', false, 'Bacterial or fungal skin infection', 'Ultra Care', NULL, NULL),
  ('Acne', 'Skin & Allergies', false, 'Skin breakouts and pimples', 'Ultra Care', NULL, NULL),
  ('Eczema', 'Skin & Allergies', false, 'Itchy, inflamed skin condition', 'Ultra Care', NULL, NULL),
  ('Dandruff', 'Skin & Allergies', false, 'Flaky scalp condition', 'Ultra Care', NULL, NULL),
  ('Scabies', 'Skin & Allergies', false, 'Itchy skin infestation', 'Ultra Care', NULL, NULL),
  ('Ringworm', 'Skin & Allergies', false, 'Fungal skin infection', 'Ultra Care', NULL, NULL),
  ('Urticaria (hives)', 'Skin & Allergies', false, 'Itchy welts on skin', 'Ultra Care', NULL, NULL),
  ('Sunburn', 'Skin & Allergies', false, 'UV radiation skin damage', 'Ultra Care', NULL, NULL),
  ('Cosmetic care (Moisture, anti-aging, etc.)', 'Skin & Allergies', false, 'Cosmetic skin treatments', NULL, 35000, 50000);