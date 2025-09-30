-- ============================================================================
-- ADD BOOKINGS TABLE
-- ============================================================================
-- Run this in Supabase SQL Editor to add booking functionality
-- ============================================================================

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT NOT NULL,
  booking_date DATE NOT NULL,
  booking_time TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_bookings_tenant_id ON bookings(tenant_id);
CREATE INDEX IF NOT EXISTS idx_bookings_service_id ON bookings(service_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_tenant_date ON bookings(tenant_id, booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_phone ON bookings(customer_phone);

-- Enable Row Level Security
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow public read all bookings" ON bookings;
DROP POLICY IF EXISTS "Allow public insert bookings" ON bookings;
DROP POLICY IF EXISTS "Allow public update bookings" ON bookings;
DROP POLICY IF EXISTS "Allow public delete bookings" ON bookings;

-- Create RLS policies (Public access for development)
CREATE POLICY "Allow public read all bookings"
  ON bookings FOR SELECT USING (true);

CREATE POLICY "Allow public insert bookings"
  ON bookings FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update bookings"
  ON bookings FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow public delete bookings"
  ON bookings FOR DELETE USING (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_bookings_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;
CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_bookings_updated_at_column();

-- ============================================================================
-- SAMPLE DATA (Optional)
-- ============================================================================

-- Insert sample bookings for Christelle's salon
DO $$
DECLARE
  christelle_id UUID;
  service_id UUID;
BEGIN
  -- Get Christelle's tenant ID
  SELECT id INTO christelle_id FROM tenants WHERE slug = 'christelles-salon' LIMIT 1;
  
  IF christelle_id IS NOT NULL THEN
    -- Get a service ID
    SELECT id INTO service_id FROM services WHERE tenant_id = christelle_id LIMIT 1;
    
    IF service_id IS NOT NULL THEN
      -- Insert sample bookings
      INSERT INTO bookings (tenant_id, service_id, customer_name, customer_email, customer_phone, booking_date, booking_time, status, notes)
      VALUES
        (christelle_id, service_id, 'Sarah Johnson', 'sarah@example.com', '+27 82 123 4567', CURRENT_DATE + INTERVAL '2 days', '10:00', 'confirmed', 'First time customer'),
        (christelle_id, service_id, 'Emma Williams', 'emma@example.com', '+27 83 234 5678', CURRENT_DATE + INTERVAL '3 days', '14:00', 'pending', NULL),
        (christelle_id, service_id, 'Lisa Brown', 'lisa@example.com', '+27 84 345 6789', CURRENT_DATE + INTERVAL '5 days', '11:30', 'confirmed', 'Regular customer')
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;
END $$;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Show bookings table structure
SELECT 
  '✅ Bookings Table Columns:' as info,
  column_name as detail
FROM information_schema.columns 
WHERE table_name = 'bookings' 
ORDER BY ordinal_position;

-- Show sample bookings
SELECT 
  '✅ Sample Bookings:' as info,
  CONCAT(customer_name, ' - ', booking_date, ' at ', booking_time, ' (', status, ')') as detail
FROM bookings
ORDER BY booking_date, booking_time;

-- Show bookings count per tenant
SELECT 
  '✅ Bookings per Tenant:' as info,
  CONCAT(t.name, ': ', COUNT(b.id), ' bookings') as detail
FROM tenants t
LEFT JOIN bookings b ON b.tenant_id = t.id
GROUP BY t.name
ORDER BY t.name;

-- Final success message
SELECT 
  '🎉 SUCCESS!' as info,
  'Bookings table created! You can now manage bookings.' as detail;

