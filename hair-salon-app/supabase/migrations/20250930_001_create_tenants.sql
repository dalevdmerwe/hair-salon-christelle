-- Migration: Create tenants table
-- Created: 2025-09-30
-- Description: Add multi-tenant support with tenants table

-- Create tenants table
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug);
CREATE INDEX IF NOT EXISTS idx_tenants_active ON tenants(is_active);

-- Enable Row Level Security
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow public read all tenants"
  ON tenants
  FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert tenants"
  ON tenants
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update tenants"
  ON tenants
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete tenants"
  ON tenants
  FOR DELETE
  USING (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_tenants_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER update_tenants_updated_at
  BEFORE UPDATE ON tenants
  FOR EACH ROW
  EXECUTE FUNCTION update_tenants_updated_at_column();

-- Insert sample tenant
INSERT INTO tenants (name, slug, description, email, phone, address, is_active) VALUES
  ('Christelle''s Hair Salon', 'christelles-salon', 'Professional hair care services in South Africa', 'info@christelle.co.za', '+27 XX XXX XXXX', 'Cape Town, South Africa', true)
ON CONFLICT (slug) DO NOTHING;

