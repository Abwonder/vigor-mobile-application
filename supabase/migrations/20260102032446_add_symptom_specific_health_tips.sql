/*
  # Add Symptom-Specific Health Tips
  
  1. New Health Tips
    - Body aches
    - Chest pain (non-emergency)
    - Period pain
    - Stomach pain / cramps
    - Testicular pain
    - General symptoms (fever, cough, etc.)
    - Respiratory & Chest symptoms
    - Skin & Allergies
    - Mental & Emotional Health
    - Women's Health
    - Men's Health
    
  2. Purpose
    - Provide tailored waiting room advice for each symptom
    - Improve user experience during triage assessment
*/

-- Body aches tips
INSERT INTO health_tips (symptom_category, title, description, icon_name, order_number) VALUES
('Body aches', 'Rest Your Body', 'Take a break and lie down comfortably. Your body needs rest to recover.', 'bed', 1),
('Body aches', 'Stay Hydrated', 'Drink plenty of water. Dehydration can worsen body aches.', 'droplet', 2),
('Body aches', 'Apply Warm Compress', 'Use a warm compress on sore areas to help relax muscles.', 'flame', 3),
('Body aches', 'Gentle Movement', 'Try light stretching if comfortable. Avoid strenuous activity.', 'move', 4);

-- Chest pain tips
INSERT INTO health_tips (symptom_category, title, description, icon_name, order_number) VALUES
('Chest pain (non-emergency)', 'Sit Up Straight', 'Sit upright and try to relax. Avoid lying flat if it worsens discomfort.', 'arrow-up', 1),
('Chest pain (non-emergency)', 'Breathe Slowly', 'Take slow, deep breaths. Avoid rapid breathing which can increase anxiety.', 'wind', 2),
('Chest pain (non-emergency)', 'Stay Calm', 'Try to remain calm. Anxiety can worsen chest discomfort.', 'heart', 3),
('Chest pain (non-emergency)', 'Loosen Tight Clothing', 'Remove any tight clothing around your chest and neck area.', 'shirt', 4);

-- Period pain tips
INSERT INTO health_tips (symptom_category, title, description, icon_name, order_number) VALUES
('Period pain', 'Apply Heat', 'Use a heating pad or hot water bottle on your lower abdomen for relief.', 'flame', 1),
('Period pain', 'Rest Comfortably', 'Lie down in a comfortable position. Try curling up on your side.', 'bed', 2),
('Period pain', 'Stay Hydrated', 'Drink warm tea or water. Staying hydrated can help reduce cramping.', 'coffee', 3),
('Period pain', 'Gentle Movement', 'Light walking or stretching may help. Avoid intense exercise.', 'move', 4);

-- Stomach pain tips
INSERT INTO health_tips (symptom_category, title, description, icon_name, order_number) VALUES
('Stomach pain / cramps', 'Avoid Eating', 'Try not to eat until your stomach settles. Small sips of water are okay.', 'x-circle', 1),
('Stomach pain / cramps', 'Lie Down Comfortably', 'Rest on your side with knees drawn up toward your chest.', 'bed', 2),
('Stomach pain / cramps', 'Apply Warmth', 'Use a heating pad on your stomach area for comfort.', 'flame', 3),
('Stomach pain / cramps', 'Stay Hydrated', 'Sip water slowly. Avoid caffeinated or carbonated drinks.', 'droplet', 4);

-- Testicular pain tips
INSERT INTO health_tips (symptom_category, title, description, icon_name, order_number) VALUES
('Testicular pain', 'Lie Down', 'Lie down and rest. Elevate your hips with a pillow if comfortable.', 'bed', 1),
('Testicular pain', 'Support the Area', 'Wear supportive underwear. Avoid tight clothing.', 'shield', 2),
('Testicular pain', 'Apply Cold Pack', 'Use a cold pack wrapped in cloth for 15 minutes at a time.', 'snowflake', 3),
('Testicular pain', 'Avoid Activity', 'Avoid physical activity, lifting, or straining.', 'ban', 4);

-- Stomach ache (child) tips
INSERT INTO health_tips (symptom_category, title, description, icon_name, order_number) VALUES
('Stomach ache (child)', 'Keep Them Comfortable', 'Help your child rest in a comfortable position.', 'bed', 1),
('Stomach ache (child)', 'Small Sips of Water', 'Give small sips of water if they can tolerate it.', 'droplet', 2),
('Stomach ache (child)', 'Gentle Tummy Rub', 'Gently rub their tummy in circular motions for comfort.', 'hand', 3),
('Stomach ache (child)', 'Avoid Food', 'Don''t force food. Let their tummy settle first.', 'x-circle', 4);

-- Fever tips
INSERT INTO health_tips (symptom_category, title, description, icon_name, order_number) VALUES
('Fever', 'Stay Hydrated', 'Drink plenty of fluids. Fever increases fluid loss.', 'droplet', 1),
('Fever', 'Rest in Bed', 'Get plenty of rest. Your body needs energy to fight infection.', 'bed', 2),
('Fever', 'Stay Cool', 'Wear light clothing and keep the room at a comfortable temperature.', 'wind', 3),
('Fever', 'Monitor Temperature', 'Check your temperature regularly and note any changes.', 'thermometer', 4);

-- Cough tips
INSERT INTO health_tips (symptom_category, title, description, icon_name, order_number) VALUES
('Cough', 'Stay Hydrated', 'Drink warm liquids like tea with honey to soothe your throat.', 'coffee', 1),
('Cough', 'Humidify the Air', 'Use a humidifier or breathe steam from a hot shower.', 'cloud', 2),
('Cough', 'Avoid Irritants', 'Stay away from smoke, strong perfumes, and cold air.', 'shield', 3),
('Cough', 'Rest Your Voice', 'Try not to talk too much. Rest helps your throat recover.', 'volume-x', 4);

-- Skin rash tips
INSERT INTO health_tips (symptom_category, title, description, icon_name, order_number) VALUES
('Skin rash', 'Don''t Scratch', 'Avoid scratching the area. This can worsen irritation and cause infection.', 'ban', 1),
('Skin rash', 'Keep Area Clean', 'Gently clean the area with mild soap and water.', 'droplet', 2),
('Skin rash', 'Apply Cool Compress', 'Use a cool, damp cloth on the rash for relief.', 'snowflake', 3),
('Skin rash', 'Avoid Irritants', 'Wear loose clothing and avoid harsh soaps or perfumes.', 'shirt', 4);

-- Anxiety tips
INSERT INTO health_tips (symptom_category, title, description, icon_name, order_number) VALUES
('Anxiety', 'Deep Breathing', 'Practice deep breathing: inhale for 4 counts, hold, exhale for 4 counts.', 'wind', 1),
('Anxiety', 'Ground Yourself', 'Name 5 things you see, 4 you hear, 3 you can touch, 2 you smell, 1 you taste.', 'eye', 2),
('Anxiety', 'Progressive Relaxation', 'Tense and relax each muscle group, starting from your toes to your head.', 'move', 3),
('Anxiety', 'Stay Present', 'Focus on the current moment. You''re taking the right steps by seeking help.', 'heart', 4);