-- Run All Migrations
-- This script runs all migrations in order
-- Use this for initial setup or to reset the database

-- ============================================================================
-- Migration 001: Create tenants table
-- ============================================================================

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

-- Drop existing policies
DROP POLICY IF EXISTS "Allow public read all tenants" ON tenants;
DROP POLICY IF EXISTS "Allow public insert tenants" ON tenants;
DROP POLICY IF EXISTS "Allow public update tenants" ON tenants;
DROP POLICY IF EXISTS "Allow public delete tenants" ON tenants;

-- Create RLS policies
CREATE POLICY "Allow public read all tenants"
  ON tenants FOR SELECT USING (true);

CREATE POLICY "Allow public insert tenants"
  ON tenants FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update tenants"
  ON tenants FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow public delete tenants"
  ON tenants FOR DELETE USING (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_tenants_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS update_tenants_updated_at ON tenants;
CREATE TRIGGER update_tenants_updated_at
  BEFORE UPDATE ON tenants
  FOR EACH ROW
  EXECUTE FUNCTION update_tenants_updated_at_column();

-- Insert sample tenant
INSERT INTO tenants (name, slug, description, email, phone, address, is_active) VALUES
  ('Christelle''s Hair Salon', 'christelles-salon', 'Professional hair care services in South Africa', 'info@christelle.co.za', '+27 XX XXX XXXX', 'Cape Town, South Africa', true)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- Migration 002: Create services table
-- ============================================================================

-- Create services table
-- tenant_id is nullable: NULL = global/template service, UUID = tenant-specific service
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  duration INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_services_tenant_id ON services(tenant_id);
CREATE INDEX IF NOT EXISTS idx_services_active ON services(is_active);

-- Enable Row Level Security
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow public read all services" ON services;
DROP POLICY IF EXISTS "Allow public insert services" ON services;
DROP POLICY IF EXISTS "Allow public update services" ON services;
DROP POLICY IF EXISTS "Allow public delete services" ON services;

-- Create RLS policies
CREATE POLICY "Allow public read all services"
  ON services FOR SELECT USING (true);

CREATE POLICY "Allow public insert services"
  ON services FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update services"
  ON services FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow public delete services"
  ON services FOR DELETE USING (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_services_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS update_services_updated_at ON services;
CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW
  EXECUTE FUNCTION update_services_updated_at_column();

-- Insert global service templates (tenant_id = NULL)
-- These can be used as templates for new tenants
INSERT INTO services (tenant_id, name, description, duration, price, is_active)
VALUES
  (NULL, 'Haircut - Women', 'Professional women''s haircut', 45, 250, true),
  (NULL, 'Haircut - Men', 'Professional men''s haircut', 30, 150, true),
  (NULL, 'Hair Coloring', 'Full hair coloring service', 120, 600, true),
  (NULL, 'Highlights', 'Hair highlighting service', 90, 450, true),
  (NULL, 'Blow Dry', 'Professional blow dry and styling', 45, 200, true),
  (NULL, 'Hair Treatment', 'Deep conditioning treatment', 45, 300, true),
  (NULL, 'Updo', 'Special occasion updo styling', 90, 400, true)
ON CONFLICT DO NOTHING;

-- Insert sample services for Christelle's salon (tenant-specific)
INSERT INTO services (tenant_id, name, description, duration, price, is_active)
SELECT
  t.id,
  s.name,
  s.description,
  s.duration,
  s.price,
  s.is_active
FROM tenants t
CROSS JOIN (
  VALUES
    ('Blow wave', 'Professional blow dry and styling', 45, 115, true),
    ('Cut & Blowwave', 'Haircut with blow dry styling', 45, 275, true),
    ('Gent Cut', 'Professional haircut for men', 30, 140, true),
    ('Cut only no Blow wave', 'Haircut without blow dry', 30, 265, true),
    ('Boys', 'Haircut for boys', 30, 70, true),
    ('Girls', 'Haircut for girls', 30, 70, true),
    ('Fringe cut', 'Fringe/bangs trim', 15, 60, true),
    ('Student Cut with Blow wave', 'Student discount haircut with blow dry', 45, 300, true),
    ('Straight Top & Cut', 'Straightening treatment with cut', 60, 465, true),
    ('Foil', 'Hair foiling/highlights', 60, 265, true),
    ('Style', 'Special occasion styling', 60, 225, true)
) AS s(name, description, duration, price, is_active)
WHERE t.slug = 'christelles-salon'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- Verification
-- ============================================================================

-- Display results
SELECT 'Tenants created:' as info, COUNT(*) as count FROM tenants
UNION ALL
SELECT 'Services created:' as info, COUNT(*) as count FROM services;

-- Show tenant details
SELECT id, name, slug, is_active FROM tenants ORDER BY name;

-- Show service count per tenant
SELECT t.name as tenant, COUNT(s.id) as service_count
FROM tenants t
LEFT JOIN services s ON s.tenant_id = t.id
GROUP BY t.name
ORDER BY t.name;

