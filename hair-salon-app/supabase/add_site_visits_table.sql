-- Site Visits Tracking Table
-- Tracks page views and visitor analytics

-- Create site_visits table
CREATE TABLE IF NOT EXISTS site_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  page_path TEXT NOT NULL,
  referrer TEXT,
  user_agent TEXT,
  ip_address TEXT,
  session_id TEXT,
  visitor_id TEXT,
  country TEXT,
  city TEXT,
  device_type TEXT, -- 'mobile', 'tablet', 'desktop'
  browser TEXT,
  os TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_site_visits_tenant_id ON site_visits(tenant_id);
CREATE INDEX IF NOT EXISTS idx_site_visits_created_at ON site_visits(created_at);
CREATE INDEX IF NOT EXISTS idx_site_visits_page_path ON site_visits(page_path);
CREATE INDEX IF NOT EXISTS idx_site_visits_session_id ON site_visits(session_id);
CREATE INDEX IF NOT EXISTS idx_site_visits_visitor_id ON site_visits(visitor_id);

-- Enable Row Level Security
ALTER TABLE site_visits ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public to insert (for tracking)
CREATE POLICY "Allow public to insert site visits"
  ON site_visits
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Policy: Allow public to read (for analytics)
CREATE POLICY "Allow public to read site visits"
  ON site_visits
  FOR SELECT
  TO public
  USING (true);

-- Create a view for daily visit statistics
CREATE OR REPLACE VIEW daily_visit_stats AS
SELECT 
  tenant_id,
  DATE(created_at) as visit_date,
  COUNT(*) as total_visits,
  COUNT(DISTINCT session_id) as unique_sessions,
  COUNT(DISTINCT visitor_id) as unique_visitors,
  COUNT(CASE WHEN device_type = 'mobile' THEN 1 END) as mobile_visits,
  COUNT(CASE WHEN device_type = 'desktop' THEN 1 END) as desktop_visits,
  COUNT(CASE WHEN device_type = 'tablet' THEN 1 END) as tablet_visits
FROM site_visits
GROUP BY tenant_id, DATE(created_at)
ORDER BY visit_date DESC;

-- Create a view for page popularity
CREATE OR REPLACE VIEW page_popularity AS
SELECT 
  tenant_id,
  page_path,
  COUNT(*) as visit_count,
  COUNT(DISTINCT session_id) as unique_sessions,
  COUNT(DISTINCT visitor_id) as unique_visitors
FROM site_visits
GROUP BY tenant_id, page_path
ORDER BY visit_count DESC;

-- Function to get visit stats for a tenant
CREATE OR REPLACE FUNCTION get_tenant_visit_stats(
  p_tenant_id UUID,
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  total_visits BIGINT,
  unique_visitors BIGINT,
  unique_sessions BIGINT,
  avg_daily_visits NUMERIC,
  mobile_percentage NUMERIC,
  desktop_percentage NUMERIC,
  tablet_percentage NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total_visits,
    COUNT(DISTINCT visitor_id)::BIGINT as unique_visitors,
    COUNT(DISTINCT session_id)::BIGINT as unique_sessions,
    ROUND(COUNT(*)::NUMERIC / NULLIF(p_days, 0), 2) as avg_daily_visits,
    ROUND(COUNT(CASE WHEN device_type = 'mobile' THEN 1 END)::NUMERIC * 100 / NULLIF(COUNT(*), 0), 2) as mobile_percentage,
    ROUND(COUNT(CASE WHEN device_type = 'desktop' THEN 1 END)::NUMERIC * 100 / NULLIF(COUNT(*), 0), 2) as desktop_percentage,
    ROUND(COUNT(CASE WHEN device_type = 'tablet' THEN 1 END)::NUMERIC * 100 / NULLIF(COUNT(*), 0), 2) as tablet_percentage
  FROM site_visits
  WHERE tenant_id = p_tenant_id
  AND created_at >= NOW() - (p_days || ' days')::INTERVAL;
END;
$$ LANGUAGE plpgsql;

-- Sample data (optional - for testing)
DO $$
DECLARE
  v_tenant_id UUID;
BEGIN
  -- Get Christelle's salon ID
  SELECT id INTO v_tenant_id FROM tenants WHERE slug = 'christelles-salon' LIMIT 1;
  
  IF v_tenant_id IS NOT NULL THEN
    -- Insert sample visits for the last 7 days
    INSERT INTO site_visits (tenant_id, page_path, device_type, browser, os, session_id, visitor_id, created_at)
    VALUES
      (v_tenant_id, '/', 'desktop', 'Chrome', 'Windows', 'sess_001', 'visitor_001', NOW() - INTERVAL '1 day'),
      (v_tenant_id, '/', 'mobile', 'Safari', 'iOS', 'sess_002', 'visitor_002', NOW() - INTERVAL '1 day'),
      (v_tenant_id, '/', 'desktop', 'Firefox', 'Windows', 'sess_003', 'visitor_003', NOW() - INTERVAL '2 days'),
      (v_tenant_id, '/', 'mobile', 'Chrome', 'Android', 'sess_004', 'visitor_004', NOW() - INTERVAL '2 days'),
      (v_tenant_id, '/', 'desktop', 'Chrome', 'macOS', 'sess_005', 'visitor_005', NOW() - INTERVAL '3 days'),
      (v_tenant_id, '/', 'tablet', 'Safari', 'iOS', 'sess_006', 'visitor_006', NOW() - INTERVAL '3 days'),
      (v_tenant_id, '/', 'mobile', 'Chrome', 'Android', 'sess_007', 'visitor_007', NOW() - INTERVAL '4 days'),
      (v_tenant_id, '/', 'desktop', 'Edge', 'Windows', 'sess_008', 'visitor_008', NOW() - INTERVAL '5 days'),
      (v_tenant_id, '/', 'mobile', 'Safari', 'iOS', 'sess_009', 'visitor_009', NOW() - INTERVAL '6 days'),
      (v_tenant_id, '/', 'desktop', 'Chrome', 'Windows', 'sess_010', 'visitor_010', NOW() - INTERVAL '7 days');
  END IF;
END $$;

COMMENT ON TABLE site_visits IS 'Tracks page views and visitor analytics for each tenant';
COMMENT ON COLUMN site_visits.session_id IS 'Unique session identifier (browser session)';
COMMENT ON COLUMN site_visits.visitor_id IS 'Unique visitor identifier (persistent across sessions)';
COMMENT ON COLUMN site_visits.device_type IS 'Type of device: mobile, tablet, or desktop';

