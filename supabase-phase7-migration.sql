-- Phase 7 Migration: Customer Management & Notifications
-- Add loyalty_points and updated_at to customers table

ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS loyalty_points INTEGER DEFAULT 0 CHECK (loyalty_points >= 0),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create maintenance_reminders table
CREATE TABLE IF NOT EXISTS maintenance_reminders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  device_brand TEXT NOT NULL,
  device_model TEXT NOT NULL,
  reminder_date TIMESTAMP WITH TIME ZONE NOT NULL,
  message TEXT,
  sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_maintenance_reminders_user_id ON maintenance_reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_reminders_customer_id ON maintenance_reminders(customer_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_reminders_reminder_date ON maintenance_reminders(reminder_date);

-- Enable RLS
ALTER TABLE maintenance_reminders ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own maintenance reminders"
  ON maintenance_reminders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own maintenance reminders"
  ON maintenance_reminders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own maintenance reminders"
  ON maintenance_reminders FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own maintenance reminders"
  ON maintenance_reminders FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger to update updated_at
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

