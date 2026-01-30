/*
  # Create Support System

  1. New Tables
    - `support_faqs`
      - `id` (uuid, primary key)
      - `category` (text) - Category of the FAQ
      - `question` (text) - The question being asked
      - `answer` (text) - The detailed answer
      - `order_position` (integer) - Display order within category
      - `is_featured` (boolean) - Whether to show in featured section
      - `view_count` (integer) - Number of times viewed
      - `helpful_count` (integer) - Number of users who found it helpful
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `support_tickets`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `subject` (text) - Subject of the support request
      - `message` (text) - Detailed message from user
      - `category` (text) - Category of the issue
      - `priority` (text) - Priority level
      - `status` (text) - Status of ticket
      - `assigned_to` (uuid) - Support staff assigned
      - `resolved_at` (timestamptz) - When ticket was resolved
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `support_ticket_messages`
      - `id` (uuid, primary key)
      - `ticket_id` (uuid, foreign key to support_tickets)
      - `user_id` (uuid, foreign key to auth.users)
      - `message` (text) - Message content
      - `is_staff_response` (boolean) - Whether message is from support staff
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Users can view public FAQs
    - Users can create and view their own support tickets

  3. Sample Data
    - Pre-populated FAQs for common questions
*/

-- Drop existing tables if they exist (for clean migration)
DROP TABLE IF EXISTS support_ticket_messages CASCADE;
DROP TABLE IF EXISTS support_tickets CASCADE;
DROP TABLE IF EXISTS support_faqs CASCADE;

-- Create support_faqs table
CREATE TABLE support_faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  question text NOT NULL,
  answer text NOT NULL,
  order_position integer DEFAULT 0,
  is_featured boolean DEFAULT false,
  view_count integer DEFAULT 0,
  helpful_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create support_tickets table
CREATE TABLE support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject text NOT NULL,
  message text NOT NULL,
  category text NOT NULL,
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  status text DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  assigned_to uuid,
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create support_ticket_messages table
CREATE TABLE support_ticket_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message text NOT NULL,
  is_staff_response boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_support_faqs_category ON support_faqs(category);
CREATE INDEX idx_support_faqs_featured ON support_faqs(is_featured) WHERE is_featured = true;
CREATE INDEX idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);
CREATE INDEX idx_support_ticket_messages_ticket_id ON support_ticket_messages(ticket_id);

-- Enable RLS
ALTER TABLE support_faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_ticket_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for support_faqs
CREATE POLICY "Anyone can view FAQs"
  ON support_faqs FOR SELECT
  USING (true);

-- RLS Policies for support_tickets
CREATE POLICY "Users can view own tickets"
  ON support_tickets FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own tickets"
  ON support_tickets FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tickets"
  ON support_tickets FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for support_ticket_messages
CREATE POLICY "Users can view messages for own tickets"
  ON support_ticket_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM support_tickets
      WHERE support_tickets.id = support_ticket_messages.ticket_id
      AND support_tickets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages for own tickets"
  ON support_ticket_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM support_tickets
      WHERE support_tickets.id = ticket_id
      AND support_tickets.user_id = auth.uid()
    )
  );

-- Insert sample FAQs
INSERT INTO support_faqs (category, question, answer, order_position, is_featured) VALUES
  ('Account', 'How do I reset my password?', 'To reset your password, go to the login screen and tap "Forgot Password". Enter your email address, and we will send you a link to create a new password. The link expires in 24 hours for security.', 1, true),
  ('Account', 'How do I update my profile information?', 'Navigate to the Profile tab, tap "Profile Info", and you can update your name, date of birth, gender, contact information, and emergency contacts. Changes are saved automatically.', 2, false),
  ('Account', 'Can I delete my account?', 'Yes, you can delete your account by going to Settings > Account > Delete Account. Please note this action is permanent and will delete all your medical records and consultation history.', 3, false),
  ('Billing', 'What payment methods do you accept?', 'We accept all major credit cards, debit cards, bank transfers, and mobile money payments. You can also use sponsor codes if your healthcare is covered by an organization.', 1, true),
  ('Billing', 'How do I view my invoices?', 'Go to Profile > Subscription to view all your past invoices and payment history. You can download PDF copies of any invoice.', 2, false),
  ('Billing', 'Can I get a refund?', 'Refunds are handled on a case-by-case basis. Please contact our support team with your invoice number and reason for the refund request. We typically respond within 24-48 hours.', 3, false),
  ('Billing', 'What if my payment fails?', 'If a payment fails, we will retry it automatically and send you a notification. You can also update your payment method in Profile > Subscription. Your subscription will remain active for 7 days while we retry.', 4, false),
  ('Medical', 'How do I start a consultation?', 'From the Home screen, tap "Start Consultation" or use the Consult tab. Answer a few triage questions about your symptoms, and we will connect you with an appropriate healthcare provider.', 1, true),
  ('Medical', 'Are my medical records secure?', 'Yes, all medical records are encrypted and stored securely. We comply with healthcare data protection regulations. Only you and your authorized healthcare providers can access your records.', 2, true),
  ('Medical', 'Can I choose my doctor?', 'After triage, you can view available specialists and choose your preferred doctor based on their specialty, ratings, and availability.', 3, false),
  ('Medical', 'How do I get a prescription?', 'During a consultation, if the doctor determines you need medication, they will send a prescription directly to your preferred pharmacy. You will receive a notification when it is ready for pickup.', 4, false),
  ('Medical', 'What if I need emergency care?', 'This app is not for medical emergencies. If you are experiencing a life-threatening condition, please call emergency services immediately or go to the nearest emergency room.', 5, true),
  ('Technical', 'The app won''t load. What should I do?', 'Try closing and reopening the app. If that doesn''t work, check your internet connection. You can also try logging out and back in. If problems persist, uninstall and reinstall the app.', 1, false),
  ('Technical', 'I''m not receiving notifications', 'Go to Settings > Notifications and ensure the relevant notification types are enabled. Also check your phone''s system settings to ensure notifications are allowed for this app.', 2, false),
  ('Technical', 'Video consultations aren''t working', 'Ensure you have a stable internet connection and have granted camera and microphone permissions. Try closing other apps that might be using your camera or microphone.', 3, false),
  ('Appointments', 'How do I schedule an appointment?', 'Go to the Appointments tab and tap "Book Appointment". Choose your preferred date, time, and healthcare provider. You will receive a confirmation once the appointment is booked.', 1, false),
  ('Appointments', 'Can I reschedule or cancel an appointment?', 'Yes, you can reschedule or cancel up to 24 hours before your appointment. Go to Appointments, select the appointment, and choose "Reschedule" or "Cancel".', 2, false),
  ('Appointments', 'What happens if I miss an appointment?', 'If you miss an appointment without canceling, you may be charged a missed appointment fee. Please try to cancel at least 24 hours in advance if you cannot make it.', 3, false);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_support_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER trigger_update_support_faqs_updated_at
  BEFORE UPDATE ON support_faqs
  FOR EACH ROW
  EXECUTE FUNCTION update_support_updated_at();

CREATE TRIGGER trigger_update_support_tickets_updated_at
  BEFORE UPDATE ON support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_support_updated_at();
