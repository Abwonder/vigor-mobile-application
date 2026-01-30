/*
  # Create Subscription System

  1. New Tables
    - `subscription_plans`
      - `id` (uuid, primary key)
      - `name` (text) - Plan name (e.g., "Free Care", "Basic Care")
      - `slug` (text, unique) - URL-friendly identifier (e.g., "free-care")
      - `description` (text) - Short plan description
      - `monthly_price` (decimal) - Monthly price in Naira
      - `yearly_price` (decimal) - Yearly price in Naira
      - `is_popular` (boolean) - Badge for popular plans
      - `features` (jsonb) - Array of feature descriptions
      - `max_users` (integer) - Maximum users allowed (null = unlimited)
      - `is_active` (boolean) - Whether plan is available
      - `display_order` (integer) - Order to display plans
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `user_subscriptions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `plan_id` (uuid, foreign key to subscription_plans)
      - `billing_cycle` (text) - "monthly" or "yearly"
      - `status` (text) - "active", "expired", "cancelled", "pending"
      - `starts_at` (timestamptz) - Subscription start date
      - `expires_at` (timestamptz) - Subscription end date
      - `is_sponsored` (boolean) - Whether payment is by sponsor
      - `sponsor_reference` (text) - Sponsor payment reference if applicable
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `payment_transactions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `subscription_id` (uuid, foreign key to user_subscriptions)
      - `amount` (decimal) - Amount paid
      - `currency` (text) - Currency code (NGN)
      - `payment_method` (text) - "direct", "sponsor", etc.
      - `payment_reference` (text) - External payment reference
      - `status` (text) - "pending", "completed", "failed"
      - `metadata` (jsonb) - Additional payment data
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Users can read their own subscriptions
    - Users can read all available plans
    - Users can create payment transactions for themselves
    - Only authenticated users can access subscription data
*/

-- Create subscription_plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text NOT NULL,
  monthly_price decimal(10,2) NOT NULL DEFAULT 0,
  yearly_price decimal(10,2) NOT NULL DEFAULT 0,
  is_popular boolean DEFAULT false,
  features jsonb DEFAULT '[]'::jsonb,
  max_users integer,
  is_active boolean DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES subscription_plans(id) ON DELETE RESTRICT,
  billing_cycle text NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'expired', 'cancelled', 'pending')),
  starts_at timestamptz,
  expires_at timestamptz,
  is_sponsored boolean DEFAULT false,
  sponsor_reference text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create payment_transactions table
CREATE TABLE IF NOT EXISTS payment_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id uuid REFERENCES user_subscriptions(id) ON DELETE SET NULL,
  amount decimal(10,2) NOT NULL,
  currency text NOT NULL DEFAULT 'NGN',
  payment_method text NOT NULL,
  payment_reference text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_slug ON subscription_plans(slug);

-- Enable RLS
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscription_plans
CREATE POLICY "Anyone can view active subscription plans"
  ON subscription_plans FOR SELECT
  USING (is_active = true);

-- RLS Policies for user_subscriptions
CREATE POLICY "Users can view own subscriptions"
  ON user_subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own subscriptions"
  ON user_subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions"
  ON user_subscriptions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for payment_transactions
CREATE POLICY "Users can view own payment transactions"
  ON payment_transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own payment transactions"
  ON payment_transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Insert default subscription plans
INSERT INTO subscription_plans (name, slug, description, monthly_price, yearly_price, is_popular, features, max_users, display_order) VALUES
  ('Free Care', 'free-care', 'First-time users who want to test the platform.', 0, 0, false, 
   '["Basic consultations", "Limited access to specialists", "Health tips and articles"]'::jsonb, 1, 1),
  
  ('Basic Care', 'basic-care', 'Individuals who need light, occasional care.', 7499, 5999.20, false,
   '["Up to 3 consultations/month", "Access to general practitioners", "Prescription services", "Health records"]'::jsonb, 1, 2),
  
  ('Standard Care', 'standard-care', 'Individuals who need ongoing care and specialist access.', 23499, 18799.20, true,
   '["Unlimited consultations", "Access to specialists", "Priority booking", "Prescription delivery", "Health monitoring", "24/7 support"]'::jsonb, 1, 3),
  
  ('Care Plus', 'care-plus', 'Families or sponsors managing multiple relatives.', 44499, 35599.20, false,
   '["All Standard Care features", "Up to 5 family members", "Family health dashboard", "Coordinated care plans", "Dedicated care coordinator"]'::jsonb, 5, 4),
  
  ('Ultra Care', 'ultra-care', 'Families with complex or ongoing health needs.', 68499, 54799.20, false,
   '["Unlimited users", "Unlimited consultations", "Weekly health checks", "Chronic care management", "Mental health support", "Care coordination with multiple providers"]'::jsonb, null, 5),
  
  ('Flexi Care (Bespoke)', 'flexi-care-bespoke', 'Organizations, high-net-worth sponsors, or patients with unique needs.', 92499, 73999.20, false,
   '["All features (consults, specialists, EMR, prescriptions, alerts, logistics, etc.)", "Priority scheduling", "Dedicated care manager", "Custom care protocols", "Advanced analytics"]'::jsonb, null, 6)
ON CONFLICT (slug) DO NOTHING;