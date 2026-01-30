/*
  # Create Notifications and Triage Timers System

  ## Overview
  This migration creates a comprehensive notification system for triage timers that allows:
  - Background timer tracking even when user navigates away
  - Notifications when triage is complete
  - Badge counters for unread notifications
  - Notification history and status tracking

  ## New Tables

  ### `triage_timers`
  Tracks active triage sessions with countdown timers that run in the background.
  - `id` (uuid, primary key) - Unique timer identifier
  - `user_id` (uuid, foreign key) - References auth.users
  - `session_id` (uuid, foreign key) - References triage_sessions
  - `symptom_name` (text) - The symptom being triaged
  - `nurse_name` (text) - Name of reviewing nurse
  - `end_time` (timestamptz) - When the timer completes
  - `status` (text) - 'active', 'completed', 'cancelled'
  - `created_at` (timestamptz) - When timer was created

  ### `notifications`
  Stores all user notifications including triage completions and other system events.
  - `id` (uuid, primary key) - Unique notification identifier
  - `user_id` (uuid, foreign key) - References auth.users
  - `type` (text) - Type: 'triage_complete', 'appointment_reminder', etc.
  - `title` (text) - Notification title
  - `message` (text) - Notification message body
  - `data` (jsonb) - Additional data (session_id, routes, etc.)
  - `is_read` (boolean) - Whether user has read the notification
  - `created_at` (timestamptz) - When notification was created

  ## Security
  - Enable RLS on both tables
  - Users can only access their own timers and notifications
  - Policies for read, insert, update, and delete operations

  ## Indexes
  - Index on user_id for fast queries
  - Index on status for filtering active timers
  - Index on is_read for unread notification counts
*/

-- Create triage_timers table
CREATE TABLE IF NOT EXISTS triage_timers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  session_id uuid REFERENCES triage_sessions NOT NULL,
  symptom_name text NOT NULL,
  nurse_name text DEFAULT 'Sophia Patel',
  end_time timestamptz NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  data jsonb DEFAULT '{}'::jsonb,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_triage_timers_user_id ON triage_timers(user_id);
CREATE INDEX IF NOT EXISTS idx_triage_timers_status ON triage_timers(status);
CREATE INDEX IF NOT EXISTS idx_triage_timers_end_time ON triage_timers(end_time);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Enable RLS
ALTER TABLE triage_timers ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for triage_timers
CREATE POLICY "Users can view own triage timers"
  ON triage_timers FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own triage timers"
  ON triage_timers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own triage timers"
  ON triage_timers FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own triage timers"
  ON triage_timers FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);