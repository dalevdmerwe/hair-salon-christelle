-- ============================================================================
-- HAIR SALON - COMPLETE DATABASE SETUP
-- ============================================================================
-- This script creates a fresh database from scratch
-- Run this entire script in Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- CLEANUP (Optional - only if you want to start fresh)
-- ============================================================================

-- Uncomment these lines if you want to drop existing tables and start fresh:
-- DROP TABLE IF EXISTS services CASCADE;
-- DROP TABLE IF EXISTS tenants CASCADE;
-- DROP POLICY IF EXISTS "Public Access to Tenant Images" ON storage.objects;
-- DROP POLICY IF EXISTS "Public Upload to Tenant Images" ON storage.objects;
-- DROP POLICY IF EXISTS "Public Update to Tenant Images" ON storage.objects;
-- DROP POLICY IF EXISTS "Public Delete from Tenant Images" ON storage.objects;
-- DELETE FROM storage.buckets WHERE id = 'tenant-images';

-- ============================================================================
-- TABLE: tenants
-- ============================================================================

CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug);
CREATE INDEX IF NOT EXISTS idx_tenants_active ON tenants(is_active);

-- Enable Row Level Security
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow public read all tenants" ON tenants;
DROP POLICY IF EXISTS "Allow public insert tenants" ON tenants;
DROP POLICY IF EXISTS "Allow public update tenants" ON tenants;
DROP POLICY IF EXISTS "Allow public delete tenants" ON tenants;

-- Create RLS policies (Public access for development)
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

-- ============================================================================
-- TABLE: services
-- ============================================================================

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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_services_tenant_id ON services(tenant_id);
CREATE INDEX IF NOT EXISTS idx_services_active ON services(is_active);
CREATE INDEX IF NOT EXISTS idx_services_tenant_active ON services(tenant_id, is_active);

-- Enable Row Level Security
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow public read all services" ON services;
DROP POLICY IF EXISTS "Allow public insert services" ON services;
DROP POLICY IF EXISTS "Allow public update services" ON services;
DROP POLICY IF EXISTS "Allow public delete services" ON services;

-- Create RLS policies (Public access for development)
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

-- ============================================================================
-- STORAGE: tenant-images bucket
-- ============================================================================

-- Create storage bucket for tenant images
INSERT INTO storage.buckets (id, name, public)
VALUES ('tenant-images', 'tenant-images', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies
DROP POLICY IF EXISTS "Public Access to Tenant Images" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload to Tenant Images" ON storage.objects;
DROP POLICY IF EXISTS "Public Update to Tenant Images" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete from Tenant Images" ON storage.objects;

-- Create storage policies (Public access for development)
CREATE POLICY "Public Access to Tenant Images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'tenant-images');

CREATE POLICY "Public Upload to Tenant Images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'tenant-images');

CREATE POLICY "Public Update to Tenant Images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'tenant-images');

CREATE POLICY "Public Delete from Tenant Images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'tenant-images');

-- ============================================================================
-- SAMPLE DATA: Christelle's Hair Salon
-- ============================================================================

-- Insert Christelle's salon
INSERT INTO tenants (name, slug, description, email, phone, address, is_active)
VALUES (
  'Christelle''s Hair Salon',
  'christelles-salon',
  'Professional hair care services in South Africa',
  'info@christelle.co.za',
  '+27 XX XXX XXXX',
  'Cape Town, South Africa',
  true
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  address = EXCLUDED.address;

-- Get Christelle's tenant ID for services
DO $$
DECLARE
  christelle_id UUID;
BEGIN
  SELECT id INTO christelle_id FROM tenants WHERE slug = 'christelles-salon';
  
  -- Insert sample services for Christelle's salon
  INSERT INTO services (tenant_id, name, description, duration, price, is_active)
  VALUES
    (christelle_id, 'Haircut - Women', 'Professional women''s haircut with styling', 60, 250.00, true),
    (christelle_id, 'Haircut - Men', 'Professional men''s haircut', 30, 150.00, true),
    (christelle_id, 'Hair Coloring', 'Full hair coloring service with premium products', 120, 600.00, true),
    (christelle_id, 'Highlights', 'Hair highlighting service', 90, 450.00, true),
    (christelle_id, 'Blow Dry', 'Professional blow dry and styling', 45, 200.00, true),
    (christelle_id, 'Hair Treatment', 'Deep conditioning treatment', 45, 300.00, true),
    (christelle_id, 'Updo', 'Special occasion updo styling', 90, 400.00, true),
    (christelle_id, 'Balayage', 'Hand-painted highlights for natural look', 150, 800.00, true),
    (christelle_id, 'Keratin Treatment', 'Smoothing keratin treatment', 180, 1200.00, true),
    (christelle_id, 'Hair Extensions', 'Premium hair extension application', 240, 2500.00, true)
  ON CONFLICT DO NOTHING;
END $$;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Show database structure
SELECT 
  '📊 DATABASE STRUCTURE' as info,
  '' as detail;

-- Tenants table columns
SELECT 
  '✅ Tenants Table Columns:' as info,
  column_name as detail
FROM information_schema.columns 
WHERE table_name = 'tenants' 
ORDER BY ordinal_position;

-- Services table columns
SELECT 
  '✅ Services Table Columns:' as info,
  column_name as detail
FROM information_schema.columns 
WHERE table_name = 'services' 
ORDER BY ordinal_position;

-- Storage bucket
SELECT 
  '✅ Storage Bucket:' as info,
  CONCAT(name, ' (public: ', public::text, ')') as detail
FROM storage.buckets 
WHERE id = 'tenant-images';

-- Show data
SELECT 
  '📋 CURRENT DATA' as info,
  '' as detail;

-- Tenants
SELECT 
  '✅ Tenants:' as info,
  CONCAT(name, ' (', slug, ')') as detail
FROM tenants 
ORDER BY name;

-- Services count per tenant
SELECT 
  '✅ Services per Tenant:' as info,
  CONCAT(t.name, ': ', COUNT(s.id), ' services') as detail
FROM tenants t
LEFT JOIN services s ON s.tenant_id = t.id
GROUP BY t.name
ORDER BY t.name;

-- All services
SELECT 
  '✅ All Services:' as info,
  CONCAT(s.name, ' - R', s.price, ' (', s.duration, ' min)') as detail
FROM services s
JOIN tenants t ON s.tenant_id = t.id
ORDER BY s.name;

-- Final success message
SELECT 
  '🎉 SUCCESS!' as info,
  'Database setup complete! You can now use the application.' as detail;

