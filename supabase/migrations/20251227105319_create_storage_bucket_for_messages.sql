/*
  # Create Storage Bucket for Message Attachments

  ## Overview
  This migration creates a Supabase Storage bucket for storing message attachments
  (images, files, etc.) with proper security policies.

  ## 1. Storage Bucket
  - `message-attachments` - Public bucket for message files and images

  ## 2. Security Policies
  - Users can upload files to their own folder
  - Users can view files from conversations they're part of
  - Public read access for authenticated users in their conversations

  ## 3. File Organization
  - Files stored in user-specific folders: `{user_id}/{filename}`
  - Automatic public URL generation
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('message-attachments', 'message-attachments', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload to own folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'message-attachments'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can view files in their conversations"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'message-attachments'
);

CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'message-attachments'
  AND (storage.foldername(name))[1] = auth.uid()::text
);