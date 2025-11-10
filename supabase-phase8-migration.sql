-- Phase 8 Migration: System Configuration & Settings
-- Add business settings, receipt templates, and user preferences tables

-- Business Settings table
CREATE TABLE IF NOT EXISTS business_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL DEFAULT 'Taller Pro',
  business_address TEXT,
  business_phone TEXT,
  business_email TEXT,
  business_tax_id TEXT,
  currency TEXT NOT NULL DEFAULT 'USD',
  tax_rate DECIMAL(5, 2) NOT NULL DEFAULT 0 CHECK (tax_rate >= 0 AND tax_rate <= 100),
  loyalty_points_rate DECIMAL(5, 2) NOT NULL DEFAULT 1 CHECK (loyalty_points_rate >= 0),
  low_stock_threshold INTEGER NOT NULL DEFAULT 5 CHECK (low_stock_threshold >= 0),
  default_payment_method TEXT NOT NULL DEFAULT 'cash' CHECK (default_payment_method IN ('cash', 'card', 'transfer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Receipt Templates table
CREATE TABLE IF NOT EXISTS receipt_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  header_text TEXT,
  footer_text TEXT,
  show_logo BOOLEAN DEFAULT FALSE,
  logo_url TEXT,
  show_qr_code BOOLEAN DEFAULT TRUE,
  show_tax_id BOOLEAN DEFAULT FALSE,
  show_business_info BOOLEAN DEFAULT TRUE,
  font_size TEXT NOT NULL DEFAULT 'medium' CHECK (font_size IN ('small', 'medium', 'large')),
  paper_width INTEGER NOT NULL DEFAULT 80 CHECK (paper_width > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_business_settings_user_id ON business_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_receipt_templates_user_id ON receipt_templates(user_id);

-- Enable RLS
ALTER TABLE business_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipt_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for business_settings
CREATE POLICY "Users can view their own business settings"
  ON business_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own business settings"
  ON business_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own business settings"
  ON business_settings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own business settings"
  ON business_settings FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for receipt_templates
CREATE POLICY "Users can view their own receipt templates"
  ON receipt_templates FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own receipt templates"
  ON receipt_templates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own receipt templates"
  ON receipt_templates FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own receipt templates"
  ON receipt_templates FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger to update updated_at
CREATE TRIGGER update_business_settings_updated_at
  BEFORE UPDATE ON business_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_receipt_templates_updated_at
  BEFORE UPDATE ON receipt_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

