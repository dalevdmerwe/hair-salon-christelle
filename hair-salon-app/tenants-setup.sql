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

-- Create index for slug lookups
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug);
CREATE INDEX IF NOT EXISTS idx_tenants_active ON tenants(is_active);

-- Enable Row Level Security
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read all tenants" ON tenants;
DROP POLICY IF EXISTS "Allow public insert tenants" ON tenants;
DROP POLICY IF EXISTS "Allow public update tenants" ON tenants;
DROP POLICY IF EXISTS "Allow public delete tenants" ON tenants;

-- Create policies for CRUD operations
-- Note: In production, restrict these to authenticated admin users only

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

-- Add tenant_id to services table
ALTER TABLE services ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;

-- Create index for tenant_id lookups
CREATE INDEX IF NOT EXISTS idx_services_tenant_id ON services(tenant_id);

-- Insert sample tenant (Christelle's salon)
INSERT INTO tenants (name, slug, description, email, phone, address, is_active) VALUES
  ('Christelle''s Hair Salon', 'christelles-salon', 'Professional hair care services in South Africa', 'info@christelle.co.za', '+27 XX XXX XXXX', 'Cape Town, South Africa', true)
ON CONFLICT (slug) DO NOTHING;

-- Create updated_at trigger for tenants
CREATE OR REPLACE FUNCTION update_tenants_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_tenants_updated_at ON tenants;
CREATE TRIGGER update_tenants_updated_at
  BEFORE UPDATE ON tenants
  FOR EACH ROW
  EXECUTE FUNCTION update_tenants_updated_at_column();

-- Display inserted tenants
SELECT id, name, slug, email, is_active FROM tenants ORDER BY name;

