/*
  # Add More Symptom-Specific Health Tips
  
  1. Additional Tips For:
    - Common cold/flu, Sore throat, Shortness of breath
    - Fatigue, Nausea, Dizziness
    - Depression, Insomnia, Panic attacks, Stress
    - Women's health (Pregnancy, Birth control, UTI)
    - Men's health (Prostate, ED, Hair loss)
    - Children's symptoms
    - STD/STI concerns
    - Skin conditions
    - Digestive issues
    
  2. Purpose
    - Provide comprehensive coverage for all symptom categories
    - Ensure every symptom has relevant waiting room advice
*/

-- Common cold / flu
INSERT INTO health_tips (symptom_category, title, description, icon_name, order_number) VALUES
('Common cold / flu', 'Rest and Sleep', 'Get plenty of rest. Your body needs energy to fight the infection.', 'bed', 1),
('Common cold / flu', 'Stay Hydrated', 'Drink warm liquids like tea, soup, or water. Avoid alcohol and caffeine.', 'coffee', 2),
('Common cold / flu', 'Humidify Air', 'Use a humidifier or breathe steam to ease congestion.', 'cloud', 3),
('Common cold / flu', 'Monitor Symptoms', 'Track your temperature and symptoms. Seek help if they worsen.', 'thermometer', 4);

-- Shortness of breath
INSERT INTO health_tips (symptom_category, title, description, icon_name, order_number) VALUES
('Shortness of breath', 'Sit Upright', 'Sit upright and lean slightly forward. Don''t lie flat.', 'arrow-up', 1),
('Shortness of breath', 'Slow Your Breathing', 'Breathe slowly through your nose and out through pursed lips.', 'wind', 2),
('Shortness of breath', 'Stay Calm', 'Try to stay calm. Anxiety can make breathing harder.', 'heart', 3),
('Shortness of breath', 'Cool Air', 'Use a fan or open a window for cool air on your face.', 'wind', 4);

-- Nausea
INSERT INTO health_tips (symptom_category, title, description, icon_name, order_number) VALUES
('Nausea', 'Avoid Food', 'Don''t eat until nausea subsides. Small sips of water are okay.', 'x-circle', 1),
('Nausea', 'Fresh Air', 'Get some fresh air. Stuffy rooms can worsen nausea.', 'wind', 2),
('Nausea', 'Ginger Tea', 'Try ginger tea or ginger ale if you can tolerate liquids.', 'coffee', 3),
('Nausea', 'Lie Still', 'Lie down with your head elevated. Avoid sudden movements.', 'bed', 4);

-- Diarrhea
INSERT INTO health_tips (symptom_category, title, description, icon_name, order_number) VALUES
('Diarrhea', 'Stay Hydrated', 'Drink plenty of clear fluids. Dehydration is the main concern.', 'droplet', 1),
('Diarrhea', 'Bland Foods', 'Stick to bland foods like rice, bananas, toast if you can eat.', 'apple', 2),
('Diarrhea', 'Avoid Dairy', 'Avoid dairy, caffeine, alcohol, and fatty foods.', 'x-circle', 3),
('Diarrhea', 'Rest', 'Rest near a bathroom. Your body is working to clear something out.', 'bed', 4);

-- Fatigue / weakness
INSERT INTO health_tips (symptom_category, title, description, icon_name, order_number) VALUES
('Fatigue / weakness', 'Rest Adequately', 'Take breaks and rest. Don''t push yourself too hard.', 'bed', 1),
('Fatigue / weakness', 'Stay Hydrated', 'Drink water. Dehydration can cause fatigue.', 'droplet', 2),
('Fatigue / weakness', 'Light Snack', 'Have a light snack if you haven''t eaten. Low blood sugar causes weakness.', 'apple', 3),
('Fatigue / weakness', 'Avoid Overexertion', 'Postpone strenuous activities until you feel better.', 'shield', 4);

-- Depression
INSERT INTO health_tips (symptom_category, title, description, icon_name, order_number) VALUES
('Depression', 'You''re Taking Action', 'Seeking help is a sign of strength, not weakness.', 'heart', 1),
('Depression', 'Be Kind to Yourself', 'Practice self-compassion. What you''re feeling is real and valid.', 'smile', 2),
('Depression', 'Small Steps Count', 'Even getting up today is an achievement. Every small step matters.', 'footprints', 3),
('Depression', 'Reach Out', 'Connect with someone you trust. You don''t have to face this alone.', 'users', 4);

-- Insomnia
INSERT INTO health_tips (symptom_category, title, description, icon_name, order_number) VALUES
('Insomnia', 'Keep a Regular Schedule', 'Go to bed and wake up at the same time every day.', 'clock', 1),
('Insomnia', 'Limit Screen Time', 'Avoid screens 1 hour before bed. Blue light disrupts sleep.', 'smartphone', 2),
('Insomnia', 'Create a Calm Environment', 'Keep your bedroom cool, dark, and quiet.', 'moon', 3),
('Insomnia', 'Relaxation Techniques', 'Try deep breathing or progressive muscle relaxation.', 'wind', 4);

-- Panic attacks
INSERT INTO health_tips (symptom_category, title, description, icon_name, order_number) VALUES
('Panic attacks', 'Breathe Slowly', 'Breathe in for 4, hold for 4, out for 4. Repeat.', 'wind', 1),
('Panic attacks', 'Ground Yourself', 'Focus on your surroundings. Name 5 things you can see.', 'eye', 2),
('Panic attacks', 'It Will Pass', 'Remind yourself: this is temporary. Panic attacks always end.', 'clock', 3),
('Panic attacks', 'Safe Space', 'Find a quiet, safe place to sit or lie down.', 'shield', 4);

-- Stress management
INSERT INTO health_tips (symptom_category, title, description, icon_name, order_number) VALUES
('Stress management', 'Deep Breathing', 'Take 5 deep breaths. Inhale slowly, exhale completely.', 'wind', 1),
('Stress management', 'Take Breaks', 'Step away from stressors when possible. Short breaks help.', 'pause', 2),
('Stress management', 'Physical Activity', 'Light exercise or stretching can reduce stress hormones.', 'move', 3),
('Stress management', 'Talk It Out', 'Share your concerns with someone you trust.', 'message-circle', 4);

-- UTI symptoms
INSERT INTO health_tips (symptom_category, title, description, icon_name, order_number) VALUES
('UTI symptoms', 'Drink Lots of Water', 'Increase your water intake. This helps flush out bacteria.', 'droplet', 1),
('UTI symptoms', 'Avoid Irritants', 'Avoid caffeine, alcohol, and spicy foods which can irritate the bladder.', 'ban', 2),
('UTI symptoms', 'Use Heat', 'Apply a heating pad to your lower abdomen for comfort.', 'flame', 3),
('UTI symptoms', 'Don''t Hold It', 'Urinate when you need to. Don''t delay bathroom trips.', 'alert-circle', 4);

-- Erectile dysfunction
INSERT INTO health_tips (symptom_category, title, description, icon_name, order_number) VALUES
('Performance issues', 'You''re Not Alone', 'This is a common issue affecting many men. Help is available.', 'users', 1),
('Performance issues', 'Reduce Stress', 'Performance anxiety can worsen the issue. Try to relax.', 'heart', 2),
('Performance issues', 'Healthy Lifestyle', 'Exercise regularly and avoid excessive alcohol.', 'activity', 3),
('Performance issues', 'Open Communication', 'Talk openly with your partner and healthcare provider.', 'message-circle', 4);

-- Prostate concerns
INSERT INTO health_tips (symptom_category, title, description, icon_name, order_number) VALUES
('Prostate concerns', 'Track Symptoms', 'Note frequency and urgency of urination for your provider.', 'clipboard', 1),
('Prostate concerns', 'Limit Evening Fluids', 'Reduce fluid intake in the evening to minimize nighttime urination.', 'moon', 2),
('Prostate concerns', 'Empty Bladder Completely', 'Take your time when urinating. Don''t rush.', 'clock', 3),
('Prostate concerns', 'Stay Active', 'Regular physical activity supports prostate health.', 'move', 4);

-- Acne
INSERT INTO health_tips (symptom_category, title, description, icon_name, order_number) VALUES
('Acne', 'Don''t Pick or Squeeze', 'Picking can cause scarring and infection. Leave it alone.', 'ban', 1),
('Acne', 'Gentle Cleansing', 'Wash your face twice daily with a mild cleanser.', 'droplet', 2),
('Acne', 'Hands Off Face', 'Avoid touching your face. Hands carry bacteria.', 'hand', 3),
('Acne', 'Clean Pillowcase', 'Change your pillowcase regularly to reduce bacteria.', 'bed', 4);

-- Eczema
INSERT INTO health_tips (symptom_category, title, description, icon_name, order_number) VALUES
('Eczema', 'Moisturize Often', 'Apply fragrance-free moisturizer several times a day.', 'droplet', 1),
('Eczema', 'Don''t Scratch', 'Scratching worsens eczema. Keep nails short, wear cotton gloves at night.', 'ban', 2),
('Eczema', 'Cool Compress', 'Apply a cool, damp cloth to itchy areas.', 'snowflake', 3),
('Eczema', 'Avoid Triggers', 'Stay away from harsh soaps, hot water, and known irritants.', 'shield', 4);

-- Allergic reaction
INSERT INTO health_tips (symptom_category, title, description, icon_name, order_number) VALUES
('Allergic reaction', 'Identify the Trigger', 'Try to identify what caused the reaction and avoid it.', 'search', 1),
('Allergic reaction', 'Cool Compress', 'Apply a cool compress to reduce swelling and itching.', 'snowflake', 2),
('Allergic reaction', 'Stay Calm', 'Most allergic reactions are mild and resolve on their own.', 'heart', 3),
('Allergic reaction', 'Monitor Symptoms', 'Watch for worsening symptoms like difficulty breathing.', 'eye', 4);

-- Ear infection (child)
INSERT INTO health_tips (symptom_category, title, description, icon_name, order_number) VALUES
('Ear infection', 'Keep Head Elevated', 'Have your child rest with their head elevated.', 'arrow-up', 1),
('Ear infection', 'Warm Compress', 'Apply a warm (not hot) compress to the affected ear.', 'flame', 2),
('Ear infection', 'Stay Hydrated', 'Encourage your child to drink fluids.', 'droplet', 3),
('Ear infection', 'Comfort Measures', 'Distract with quiet activities. Avoid flying or swimming.', 'heart', 4);

-- Sore throat
INSERT INTO health_tips (symptom_category, title, description, icon_name, order_number) VALUES
('Sore throat', 'Warm Liquids', 'Sip warm tea with honey or warm salt water.', 'coffee', 1),
('Sore throat', 'Rest Your Voice', 'Try not to talk too much. Give your throat a break.', 'volume-x', 2),
('Sore throat', 'Humidify Air', 'Use a humidifier to add moisture to the air.', 'cloud', 3),
('Sore throat', 'Avoid Irritants', 'Stay away from smoke, strong smells, and cold air.', 'shield', 4);

-- General tips for STD/STI concerns
INSERT INTO health_tips (symptom_category, title, description, icon_name, order_number) VALUES
('STD/STI testing', 'You''re Being Responsible', 'Getting tested is a mature, responsible decision.', 'heart', 1),
('STD/STI testing', 'Confidential Care', 'Your test results and consultation are completely confidential.', 'lock', 2),
('STD/STI testing', 'Most Are Treatable', 'Most STIs are easily treated, especially when caught early.', 'check-circle', 3),
('STD/STI testing', 'Know Your Status', 'Knowing your status helps protect you and your partners.', 'shield', 4);