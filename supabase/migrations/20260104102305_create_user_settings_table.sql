/*
  # Create User Settings System

  1. New Tables
    - `user_settings`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users) - The user these settings belong to
      
      Notification Settings:
      - `consultation_reminders` (boolean) - Alert before consultations start
      - `prescription_refill_reminders` (boolean) - Notify when time to refill medication
      - `billing_subscription_updates` (boolean) - Updates on payments, renewals, invoices
      - `general_updates` (boolean) - Messages about service changes or downtime
      - `text_message_updates` (boolean) - Real time text message updates
      
      Privacy Settings:
      - `sponsor_can_view_emr` (boolean) - Allow sponsor to see medical records, prescriptions, test results
      - `sponsor_can_manage_health` (boolean) - Allow sponsor to book consultations, approve prescriptions, handle care decisions
      - `save_consultation_chats` (boolean) - Keep past consultation chats stored on device
      - `auto_clear_chats` (boolean) - Automatically delete stored chats after 30 days
      
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on user_settings table
    - Users can view and update their own settings only
    - Auto-create default settings when user profile is created

  3. Indexes
    - Index on user_id for fast lookups
*/

-- Create user_settings table
CREATE TABLE IF NOT EXISTS user_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Notification settings (defaults to true for important notifications)
  consultation_reminders boolean NOT NULL DEFAULT true,
  prescription_refill_reminders boolean NOT NULL DEFAULT false,
  billing_subscription_updates boolean NOT NULL DEFAULT true,
  general_updates boolean NOT NULL DEFAULT true,
  text_message_updates boolean NOT NULL DEFAULT true,
  
  -- Privacy settings
  sponsor_can_view_emr boolean NOT NULL DEFAULT true,
  sponsor_can_manage_health boolean NOT NULL DEFAULT false,
  save_consultation_chats boolean NOT NULL DEFAULT true,
  auto_clear_chats boolean NOT NULL DEFAULT true,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

-- Enable RLS
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own settings"
  ON user_settings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON user_settings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
  ON user_settings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Function to create default settings for new users
CREATE OR REPLACE FUNCTION create_default_user_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create settings when user profile is created
DROP TRIGGER IF EXISTS trigger_create_default_settings ON user_profiles;
CREATE TRIGGER trigger_create_default_settings
  AFTER INSERT ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_default_user_settings();

-- Update function to track updated_at
CREATE OR REPLACE FUNCTION update_user_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_user_settings_updated_at ON user_settings;
CREATE TRIGGER trigger_update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_user_settings_updated_at();
