-- Create services table
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  duration INTEGER NOT NULL, -- in minutes
  price DECIMAL(10, 2) NOT NULL, -- in ZAR
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for active services
CREATE INDEX IF NOT EXISTS idx_services_active ON services(is_active);

-- Enable Row Level Security
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access to active services
CREATE POLICY "Allow public read access to active services"
  ON services
  FOR SELECT
  USING (is_active = true);

-- Create policy to allow authenticated users to read all services
CREATE POLICY "Allow authenticated users to read all services"
  ON services
  FOR SELECT
  TO authenticated
  USING (true);

-- Insert sample services from your services.json
INSERT INTO services (name, description, duration, price, is_active) VALUES
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
ON CONFLICT DO NOTHING;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Display inserted services
SELECT id, name, duration, price, is_active FROM services ORDER BY name;

