-- Migration: Create services table
-- Created: 2025-09-30
-- Description: Create services table with tenant relationship

-- Create services table
-- tenant_id is nullable: NULL = global/template service, UUID = tenant-specific service
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  duration INTEGER NOT NULL, -- in minutes
  price DECIMAL(10, 2) NOT NULL, -- in ZAR
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_services_tenant_id ON services(tenant_id);
CREATE INDEX IF NOT EXISTS idx_services_active ON services(is_active);

-- Enable Row Level Security
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow public read all services"
  ON services
  FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert services"
  ON services
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update services"
  ON services
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete services"
  ON services
  FOR DELETE
  USING (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_services_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
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

