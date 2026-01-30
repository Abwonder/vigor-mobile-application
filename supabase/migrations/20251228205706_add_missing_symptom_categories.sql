/*
  # Add Missing Symptom Categories
  
  This migration adds symptoms for the categories that are currently missing from the database.
  
  1. New Categories Being Added:
    - Mental & Emotional Health (Anxiety, Depression, Stress management, Insomnia, Counseling)
    - Women's Health (Period pain, pregnancy concerns, menopause, fertility issues, contraception)
    - Men's Health (Performance issues, prostate concerns, urine problems, hair loss, testosterone)
    - Children's Health (Fever, cough, sore throat, rashes, growth issues)
    - STD/STI (HIV care, Gonorrhea, Chlamydia, Syphilis, Genital herpes, HPV, STI testing)
    - Condition Management (Diabetes, Hypertension, Sickle cell, Cancer screening, Chronic conditions)
  
  2. Coverage Plans:
    - Most symptoms covered under "Ultra Care" plan
    - Some specialized services have direct pricing (e.g., Counseling ₦35,000, STI testing ₦40,000)
  
  3. Security:
    - All data is inserted using safe INSERT statements
    - No user-modifiable data in this migration
*/

-- Insert Mental & Emotional Health symptoms
INSERT INTO symptoms_catalog (name, category, description, coverage_plan, direct_price_min, direct_price_max, common, severity_level) VALUES
('Anxiety', 'Mental & Emotional Health', 'Persistent worry, nervousness, or fear', 'Ultra Care', NULL, NULL, true, 'moderate'),
('Depression', 'Mental & Emotional Health', 'Persistent sadness, loss of interest', 'Ultra Care', NULL, NULL, true, 'moderate'),
('Stress management', 'Mental & Emotional Health', 'Help managing stress and anxiety', 'Ultra Care', NULL, NULL, false, 'moderate'),
('Insomnia', 'Mental & Emotional Health', 'Difficulty falling or staying asleep', 'Ultra Care', NULL, NULL, true, 'moderate'),
('Counseling / therapy session', 'Mental & Emotional Health', 'Professional mental health counseling', NULL, 35000, 35000, false, 'moderate'),
('Panic attacks', 'Mental & Emotional Health', 'Sudden episodes of intense fear', 'Ultra Care', NULL, NULL, false, 'high'),
('Mood swings', 'Mental & Emotional Health', 'Rapid changes in emotional state', 'Ultra Care', NULL, NULL, false, 'moderate');

-- Insert Women's Health symptoms
INSERT INTO symptoms_catalog (name, category, description, coverage_plan, direct_price_min, direct_price_max, common, severity_level) VALUES
('Period pain', 'Women''s Health', 'Menstrual cramps and discomfort', 'Ultra Care', NULL, NULL, true, 'moderate'),
('Pregnancy concerns', 'Women''s Health', 'Questions or issues during pregnancy', 'Ultra Care', NULL, NULL, true, 'moderate'),
('Menopause symptoms', 'Women''s Health', 'Hot flashes, mood changes', 'Ultra Care', NULL, NULL, false, 'moderate'),
('Fertility issues', 'Women''s Health', 'Difficulty conceiving', 'Care Plus', NULL, NULL, false, 'moderate'),
('Contraception advice', 'Women''s Health', 'Birth control options and guidance', 'Standard Care', NULL, NULL, false, 'low'),
('Irregular periods', 'Women''s Health', 'Unpredictable menstrual cycles', 'Ultra Care', NULL, NULL, true, 'moderate'),
('PCOS', 'Women''s Health', 'Polycystic ovary syndrome management', 'Ultra Care', NULL, NULL, false, 'moderate'),
('Vaginal infections', 'Women''s Health', 'Yeast infections, bacterial vaginosis', 'Ultra Care', NULL, NULL, true, 'moderate');

-- Insert Men's Health symptoms
INSERT INTO symptoms_catalog (name, category, description, coverage_plan, direct_price_min, direct_price_max, common, severity_level) VALUES
('Performance issues', 'Men''s Health', 'Erectile dysfunction, intimacy concerns', 'Ultra Care', NULL, NULL, true, 'moderate'),
('Prostate concerns', 'Men''s Health', 'Prostate health and screening', 'Care Plus', NULL, NULL, false, 'moderate'),
('Urine problems', 'Men''s Health', 'Difficulty or pain when urinating', 'Ultra Care', NULL, NULL, true, 'moderate'),
('Hair loss', 'Men''s Health', 'Male pattern baldness treatment', 'Care Plus', NULL, NULL, false, 'low'),
('Low testosterone', 'Men''s Health', 'Fatigue, low libido, muscle loss', 'Ultra Care', NULL, NULL, false, 'moderate'),
('Testicular pain', 'Men''s Health', 'Pain or swelling in testicles', 'Ultra Care', NULL, NULL, false, 'high');

-- Insert Children's Health symptoms
INSERT INTO symptoms_catalog (name, category, description, coverage_plan, direct_price_min, direct_price_max, common, severity_level) VALUES
('Fever (child)', 'Children''s Health', 'Elevated temperature in children', 'Ultra Care', NULL, NULL, true, 'moderate'),
('Cough (child)', 'Children''s Health', 'Persistent cough in children', 'Ultra Care', NULL, NULL, true, 'moderate'),
('Sore throat (child)', 'Children''s Health', 'Throat pain in children', 'Ultra Care', NULL, NULL, true, 'moderate'),
('Rashes (child)', 'Children''s Health', 'Skin rashes in children', 'Ultra Care', NULL, NULL, true, 'moderate'),
('Growth concerns', 'Children''s Health', 'Questions about child development', 'Standard Care', NULL, NULL, false, 'low'),
('Vaccination advice', 'Children''s Health', 'Immunization guidance', 'Basic Care', NULL, NULL, false, 'low'),
('Stomach ache (child)', 'Children''s Health', 'Abdominal pain in children', 'Ultra Care', NULL, NULL, true, 'moderate'),
('Ear infection', 'Children''s Health', 'Ear pain or infection', 'Ultra Care', NULL, NULL, true, 'moderate');

-- Insert STD/STI symptoms
INSERT INTO symptoms_catalog (name, category, description, coverage_plan, direct_price_min, direct_price_max, common, severity_level) VALUES
('HIV care & counseling', 'STD/STI', 'HIV testing, treatment, and support', 'Ultra Care', NULL, NULL, false, 'high'),
('Gonorrhea', 'STD/STI', 'Testing and treatment for gonorrhea', 'Ultra Care', NULL, NULL, true, 'high'),
('Chlamydia', 'STD/STI', 'Testing and treatment for chlamydia', 'Ultra Care', NULL, NULL, true, 'high'),
('Syphilis', 'STD/STI', 'Testing and treatment for syphilis', 'Ultra Care', NULL, NULL, true, 'high'),
('Genital herpes', 'STD/STI', 'HSV testing and management', 'Ultra Care', NULL, NULL, true, 'high'),
('HPV / genital warts', 'STD/STI', 'HPV testing and treatment', 'Ultra Care', NULL, NULL, true, 'moderate'),
('STI testing package', 'STD/STI', 'Comprehensive STI screening panel', NULL, 40000, 40000, false, 'moderate'),
('Hepatitis B/C', 'STD/STI', 'Testing and treatment', 'Ultra Care', NULL, NULL, false, 'high');

-- Insert Condition Management symptoms
INSERT INTO symptoms_catalog (name, category, description, coverage_plan, direct_price_min, direct_price_max, common, severity_level) VALUES
('Diabetes', 'Condition Management', 'Blood sugar management and monitoring', 'Ultra Care', NULL, NULL, true, 'high'),
('Hypertension', 'Condition Management', 'High blood pressure management', 'Ultra Care', NULL, NULL, true, 'high'),
('Sickle cell', 'Condition Management', 'Sickle cell disease management', 'Ultra Care', NULL, NULL, false, 'high'),
('Cancer screening', 'Condition Management', 'Early detection screenings', 'Care Plus', NULL, NULL, false, 'moderate'),
('Asthma management', 'Condition Management', 'Ongoing asthma care', 'Ultra Care', NULL, NULL, true, 'high'),
('Arthritis', 'Condition Management', 'Joint pain and inflammation', 'Care Plus', NULL, NULL, false, 'moderate'),
('Thyroid disorders', 'Condition Management', 'Hyper/hypothyroidism management', 'Ultra Care', NULL, NULL, false, 'moderate'),
('Cholesterol management', 'Condition Management', 'High cholesterol treatment', 'Ultra Care', NULL, NULL, false, 'moderate');