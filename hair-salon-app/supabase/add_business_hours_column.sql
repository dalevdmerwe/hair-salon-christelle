-- Add business_hours column to tenants table
-- This column stores operating hours as JSONB

-- Add the column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'tenants' 
    AND column_name = 'business_hours'
  ) THEN
    ALTER TABLE tenants 
    ADD COLUMN business_hours JSONB DEFAULT NULL;
    
    COMMENT ON COLUMN tenants.business_hours IS 'Operating hours for each day of the week';
  END IF;
END $$;

-- Example business_hours format:
-- {
--   "monday": "9:00 AM - 5:00 PM",
--   "tuesday": "9:00 AM - 5:00 PM",
--   "wednesday": "9:00 AM - 5:00 PM",
--   "thursday": "9:00 AM - 5:00 PM",
--   "friday": "9:00 AM - 5:00 PM",
--   "saturday": "10:00 AM - 2:00 PM",
--   "sunday": "Closed"
-- }

-- Update existing tenants with default business hours (optional)
UPDATE tenants
SET business_hours = jsonb_build_object(
  'monday', '9:00 AM - 5:00 PM',
  'tuesday', '9:00 AM - 5:00 PM',
  'wednesday', '9:00 AM - 5:00 PM',
  'thursday', '9:00 AM - 5:00 PM',
  'friday', '9:00 AM - 5:00 PM',
  'saturday', '10:00 AM - 2:00 PM',
  'sunday', 'Closed'
)
WHERE business_hours IS NULL;

