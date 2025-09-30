-- Quick Fix: Add Multi-Tenant Support to Existing Database
-- Run this if you already have a services table without tenant_id

-- Step 1: Create tenants table if it doesn't exist
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

-- Step 2: Add tenant_id to services table
ALTER TABLE services 
ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;

-- Create index for tenant_id
CREATE INDEX IF NOT EXISTS idx_services_tenant_id ON services(tenant_id);

-- Step 3: Assign existing services to Christelle's salon
UPDATE services 
SET tenant_id = (SELECT id FROM tenants WHERE slug = 'christelles-salon' LIMIT 1)
WHERE tenant_id IS NULL;

-- Step 4: Insert some global service templates (optional)
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

-- Verification: Show services by tenant
SELECT 
  CASE 
    WHEN s.tenant_id IS NULL THEN '🌐 Global Template'
    ELSE '🏢 ' || t.name
  END as tenant,
  COUNT(*) as service_count
FROM services s
LEFT JOIN tenants t ON s.tenant_id = t.id
GROUP BY s.tenant_id, t.name
ORDER BY s.tenant_id NULLS FIRST;

-- Show all tenants
SELECT '✅ Tenants:' as info;
SELECT id, name, slug, is_active FROM tenants ORDER BY name;

-- Show service distribution
SELECT '✅ Services:' as info;
SELECT 
  s.name,
  CASE 
    WHEN s.tenant_id IS NULL THEN 'Global Template'
    ELSE t.name
  END as tenant
FROM services s
LEFT JOIN tenants t ON s.tenant_id = t.id
ORDER BY s.tenant_id NULLS FIRST, s.name;

