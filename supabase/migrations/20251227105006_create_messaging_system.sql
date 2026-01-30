/*
  # Create Messaging System

  ## Overview
  This migration creates a complete real-time messaging system for healthcare communication
  between patients and providers with support for text messages, file/image attachments,
  read receipts, and typing indicators.

  ## 1. New Tables

  ### conversations
  Manages conversation threads between users
  - `id` (uuid, primary key) - Unique conversation identifier
  - `created_at` (timestamptz) - When conversation was started
  - `updated_at` (timestamptz) - Last message timestamp
  - `last_message` (text) - Preview of most recent message
  - `last_message_at` (timestamptz) - Timestamp of last message

  ### conversation_participants
  Tracks which users are in each conversation
  - `id` (uuid, primary key) - Unique participant record
  - `conversation_id` (uuid) - References conversations table
  - `user_id` (uuid) - References auth.users table
  - `joined_at` (timestamptz) - When user joined conversation
  - `last_read_at` (timestamptz) - Last time user read messages

  ### messages
  Stores individual messages in conversations
  - `id` (uuid, primary key) - Unique message identifier
  - `conversation_id` (uuid) - References conversations table
  - `sender_id` (uuid) - References auth.users (who sent the message)
  - `content` (text) - Message text content
  - `created_at` (timestamptz) - When message was sent
  - `updated_at` (timestamptz) - When message was edited
  - `deleted_at` (timestamptz) - Soft delete timestamp
  - `is_edited` (boolean) - Whether message was edited

  ### message_attachments
  Stores file and image attachments for messages
  - `id` (uuid, primary key) - Unique attachment identifier
  - `message_id` (uuid) - References messages table
  - `file_url` (text) - Supabase storage URL for file
  - `file_name` (text) - Original filename
  - `file_type` (text) - MIME type (image/png, application/pdf, etc.)
  - `file_size` (integer) - Size in bytes
  - `created_at` (timestamptz) - Upload timestamp

  ### message_read_receipts
  Tracks which messages have been read by which users
  - `id` (uuid, primary key) - Unique receipt identifier
  - `message_id` (uuid) - References messages table
  - `user_id` (uuid) - References auth.users (who read it)
  - `read_at` (timestamptz) - When message was read

  ### typing_indicators
  Real-time typing status for conversations
  - `id` (uuid, primary key) - Unique indicator identifier
  - `conversation_id` (uuid) - References conversations table
  - `user_id` (uuid) - References auth.users (who is typing)
  - `is_typing` (boolean) - Current typing status
  - `updated_at` (timestamptz) - Last update timestamp

  ## 2. Security
  - Row Level Security (RLS) enabled on all tables
  - Users can only access conversations they are participants in
  - Users can only read messages from their conversations
  - Users can only send messages to conversations they're in
  - Read receipts only visible to conversation participants
  - Typing indicators only visible to conversation participants

  ## 3. Indexes
  - Indexed foreign keys for optimal query performance
  - Indexed timestamps for sorting and filtering
  - Composite indexes for common query patterns

  ## 4. Functions & Triggers
  - Automatic updated_at timestamp updates
  - Automatic conversation last_message updates
  - Cleanup of old typing indicators
*/

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_message text,
  last_message_at timestamptz
);

-- Create conversation_participants table
CREATE TABLE IF NOT EXISTS conversation_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  joined_at timestamptz DEFAULT now(),
  last_read_at timestamptz DEFAULT now(),
  UNIQUE(conversation_id, user_id)
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz,
  is_edited boolean DEFAULT false
);

-- Create message_attachments table
CREATE TABLE IF NOT EXISTS message_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid REFERENCES messages(id) ON DELETE CASCADE NOT NULL,
  file_url text NOT NULL,
  file_name text NOT NULL,
  file_type text NOT NULL,
  file_size integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create message_read_receipts table
CREATE TABLE IF NOT EXISTS message_read_receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid REFERENCES messages(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  read_at timestamptz DEFAULT now(),
  UNIQUE(message_id, user_id)
);

-- Create typing_indicators table
CREATE TABLE IF NOT EXISTS typing_indicators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  is_typing boolean DEFAULT false,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(conversation_id, user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_conversation_participants_conversation 
  ON conversation_participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user 
  ON conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation 
  ON messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender 
  ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_message_attachments_message 
  ON message_attachments(message_id);
CREATE INDEX IF NOT EXISTS idx_message_read_receipts_message 
  ON message_read_receipts(message_id);
CREATE INDEX IF NOT EXISTS idx_message_read_receipts_user 
  ON message_read_receipts(user_id);
CREATE INDEX IF NOT EXISTS idx_typing_indicators_conversation 
  ON typing_indicators(conversation_id);

-- Enable Row Level Security
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_read_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE typing_indicators ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversations
CREATE POLICY "Users can view conversations they participate in"
  ON conversations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_participants.conversation_id = conversations.id
      AND conversation_participants.user_id = auth.uid()
    )
  );

-- RLS Policies for conversation_participants
CREATE POLICY "Users can view participants in their conversations"
  ON conversation_participants FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = conversation_participants.conversation_id
      AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join conversations"
  ON conversation_participants FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their participant record"
  ON conversation_participants FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for messages
CREATE POLICY "Users can view messages in their conversations"
  ON messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_participants.conversation_id = messages.conversation_id
      AND conversation_participants.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages to their conversations"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_participants.conversation_id = messages.conversation_id
      AND conversation_participants.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own messages"
  ON messages FOR UPDATE
  TO authenticated
  USING (sender_id = auth.uid())
  WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can soft delete their own messages"
  ON messages FOR UPDATE
  TO authenticated
  USING (sender_id = auth.uid())
  WITH CHECK (sender_id = auth.uid());

-- RLS Policies for message_attachments
CREATE POLICY "Users can view attachments in their conversations"
  ON message_attachments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM messages
      JOIN conversation_participants ON messages.conversation_id = conversation_participants.conversation_id
      WHERE messages.id = message_attachments.message_id
      AND conversation_participants.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add attachments to their messages"
  ON message_attachments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM messages
      WHERE messages.id = message_attachments.message_id
      AND messages.sender_id = auth.uid()
    )
  );

-- RLS Policies for message_read_receipts
CREATE POLICY "Users can view read receipts in their conversations"
  ON message_read_receipts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM messages
      JOIN conversation_participants ON messages.conversation_id = conversation_participants.conversation_id
      WHERE messages.id = message_read_receipts.message_id
      AND conversation_participants.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can mark messages as read"
  ON message_read_receipts FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for typing_indicators
CREATE POLICY "Users can view typing indicators in their conversations"
  ON typing_indicators FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_participants.conversation_id = typing_indicators.conversation_id
      AND conversation_participants.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their typing status"
  ON typing_indicators FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own typing indicator"
  ON typing_indicators FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Function to update conversation's updated_at timestamp
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET 
    updated_at = NEW.created_at,
    last_message = NEW.content,
    last_message_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update conversation on new message
DROP TRIGGER IF EXISTS on_message_created ON messages;
CREATE TRIGGER on_message_created
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_timestamp();

-- Function to automatically clean up old typing indicators
CREATE OR REPLACE FUNCTION cleanup_typing_indicators()
RETURNS void AS $$
BEGIN
  UPDATE typing_indicators
  SET is_typing = false
  WHERE is_typing = true
  AND updated_at < now() - interval '10 seconds';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;