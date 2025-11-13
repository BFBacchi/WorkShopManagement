-- Migration: Customer Actions Table
-- Create table for customer actions (notes, calls, visits, etc.)

CREATE TABLE IF NOT EXISTS customer_actions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('note', 'call', 'visit', 'email', 'task', 'other')),
  title TEXT NOT NULL,
  description TEXT,
  action_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customer_actions_user_id ON customer_actions(user_id);
CREATE INDEX IF NOT EXISTS idx_customer_actions_customer_id ON customer_actions(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_actions_action_date ON customer_actions(action_date);
CREATE INDEX IF NOT EXISTS idx_customer_actions_action_type ON customer_actions(action_type);

-- Enable Row Level Security (RLS)
ALTER TABLE customer_actions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own customer actions"
  ON customer_actions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own customer actions"
  ON customer_actions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own customer actions"
  ON customer_actions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own customer actions"
  ON customer_actions FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_customer_actions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_customer_actions_updated_at
  BEFORE UPDATE ON customer_actions
  FOR EACH ROW
  EXECUTE FUNCTION update_customer_actions_updated_at();

