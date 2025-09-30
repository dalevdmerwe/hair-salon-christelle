-- Migration: Add tenant_id to existing services table
-- Created: 2025-09-30
-- Description: Add tenant_id column to services table for multi-tenant support

-- Add tenant_id column if it doesn't exist
ALTER TABLE services 
ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;

-- Create index for tenant_id lookups
CREATE INDEX IF NOT EXISTS idx_services_tenant_id ON services(tenant_id);

-- Update existing services to belong to Christelle's salon
UPDATE services 
SET tenant_id = (SELECT id FROM tenants WHERE slug = 'christelles-salon' LIMIT 1)
WHERE tenant_id IS NULL;

-- Verification
SELECT 
  CASE 
    WHEN tenant_id IS NULL THEN 'Global Template'
    ELSE (SELECT name FROM tenants WHERE id = tenant_id)
  END as tenant,
  COUNT(*) as service_count
FROM services
GROUP BY tenant_id
ORDER BY tenant_id NULLS FIRST;

