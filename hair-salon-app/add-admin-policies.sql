-- Add policies for admin CRUD operations
-- Run this if you already have the services table created

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow public read access to active services" ON services;
DROP POLICY IF EXISTS "Allow authenticated users to read all services" ON services;
DROP POLICY IF EXISTS "Allow public read all services" ON services;
DROP POLICY IF EXISTS "Allow public insert services" ON services;
DROP POLICY IF EXISTS "Allow public update services" ON services;
DROP POLICY IF EXISTS "Allow public delete services" ON services;

-- Create policy to allow public read access to ALL services (for admin page)
-- Note: In production, you should add authentication and restrict this to admin users only
CREATE POLICY "Allow public read all services"
  ON services
  FOR SELECT
  USING (true);

-- Create policy to allow public insert (for admin page)
-- Note: In production, you should add authentication and restrict this to admin users only
CREATE POLICY "Allow public insert services"
  ON services
  FOR INSERT
  WITH CHECK (true);

-- Create policy to allow public update (for admin page)
-- Note: In production, you should add authentication and restrict this to admin users only
CREATE POLICY "Allow public update services"
  ON services
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Create policy to allow public delete (for admin page)
-- Note: In production, you should add authentication and restrict this to admin users only
CREATE POLICY "Allow public delete services"
  ON services
  FOR DELETE
  USING (true);

-- Verify policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'services';

