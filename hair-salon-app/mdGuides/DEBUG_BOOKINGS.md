# 🔍 Debug Bookings Not Showing

## Quick Checks

### 1. Check Browser Console

Open browser console (F12) and look for:
- "Loading bookings for tenant: [tenant-id]"
- "Loaded bookings: [array]"
- Any error messages

### 2. Verify Database Migration

Run this in Supabase SQL Editor:

```sql
-- Check if bookings table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'bookings';

-- Check bookings data
SELECT * FROM bookings;

-- Check with tenant info
SELECT 
  b.*,
  t.name as tenant_name,
  s.name as service_name
FROM bookings b
LEFT JOIN tenants t ON t.id = b.tenant_id
LEFT JOIN services s ON s.id = b.service_id
ORDER BY b.created_at DESC;
```

### 3. Check Tenant ID

The booking must have the correct `tenant_id`.

Run this to see your tenant IDs:

```sql
SELECT id, name, slug FROM tenants;
```

Make sure the booking's `tenant_id` matches the tenant you're viewing.

### 4. Check Foreign Keys

Run this to verify relationships:

```sql
-- Check if service_id exists
SELECT 
  b.id,
  b.customer_name,
  b.service_id,
  s.name as service_name
FROM bookings b
LEFT JOIN services s ON s.id = b.service_id;

-- Check if tenant_id exists
SELECT 
  b.id,
  b.customer_name,
  b.tenant_id,
  t.name as tenant_name
FROM bookings b
LEFT JOIN tenants t ON t.id = b.tenant_id;
```

If `service_name` or `tenant_name` is NULL, the foreign key is broken.

### 5. Test Query Directly

Run the exact query the app uses:

```sql
SELECT 
  b.*,
  s.name as service_name,
  s.price as service_price,
  s.duration as service_duration,
  t.name as tenant_name
FROM bookings b
INNER JOIN services s ON s.id = b.service_id
INNER JOIN tenants t ON t.id = b.tenant_id
WHERE b.tenant_id = 'YOUR_TENANT_ID_HERE'
ORDER BY b.booking_date ASC, b.booking_time ASC;
```

Replace `YOUR_TENANT_ID_HERE` with your actual tenant ID.

## Common Issues

### Issue 1: Booking Created with Wrong Tenant ID

**Symptom:** Booking exists but doesn't show for your tenant

**Check:**
```sql
SELECT tenant_id, customer_name FROM bookings;
SELECT id, name FROM tenants;
```

**Fix:** Update the booking's tenant_id:
```sql
UPDATE bookings 
SET tenant_id = 'CORRECT_TENANT_ID'
WHERE id = 'BOOKING_ID';
```

### Issue 2: Service Deleted

**Symptom:** Booking exists but service was deleted

**Check:**
```sql
SELECT b.service_id, s.id, s.name
FROM bookings b
LEFT JOIN services s ON s.id = b.service_id;
```

If `s.id` is NULL, the service doesn't exist.

**Fix:** Either restore the service or update the booking to use a different service.

### Issue 3: Foreign Key Constraint

**Symptom:** Can't create booking

**Check:**
```sql
-- Check if service exists
SELECT id, name FROM services WHERE id = 'SERVICE_ID';

-- Check if tenant exists
SELECT id, name FROM tenants WHERE id = 'TENANT_ID';
```

**Fix:** Make sure both service and tenant exist before creating booking.

### Issue 4: RLS Policies Blocking

**Symptom:** No error but no data returned

**Check:**
```sql
-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'bookings';

-- Check policies
SELECT * FROM pg_policies WHERE tablename = 'bookings';
```

**Fix:** Make sure public read policy exists:
```sql
CREATE POLICY "Allow public read all bookings"
  ON bookings FOR SELECT USING (true);
```

## Manual Test

### Create a Test Booking

```sql
-- Get tenant ID
SELECT id FROM tenants WHERE slug = 'christelles-salon';

-- Get service ID
SELECT id FROM services LIMIT 1;

-- Create test booking
INSERT INTO bookings (
  tenant_id,
  service_id,
  customer_name,
  customer_phone,
  booking_date,
  booking_time,
  status
) VALUES (
  'TENANT_ID_HERE',
  'SERVICE_ID_HERE',
  'Test Customer',
  '+27 82 123 4567',
  CURRENT_DATE + INTERVAL '1 day',
  '10:00',
  'pending'
);

-- Verify it was created
SELECT * FROM bookings WHERE customer_name = 'Test Customer';
```

## Debug Steps

1. **Open browser console** (F12)
2. **Go to bookings page** `/admin/{tenantId}/bookings`
3. **Check console logs:**
   - "Loading bookings for tenant: ..."
   - "Bookings data: ..."
   - "Loaded bookings: ..."
4. **Check Network tab:**
   - Look for request to Supabase
   - Check response data
5. **Run SQL queries** above in Supabase

## Quick Fix Script

Run this in Supabase to check everything:

```sql
-- 1. Check tables exist
SELECT 'Tables:' as check_type, table_name 
FROM information_schema.tables 
WHERE table_name IN ('bookings', 'services', 'tenants');

-- 2. Check data exists
SELECT 'Tenants:' as check_type, COUNT(*) as count FROM tenants
UNION ALL
SELECT 'Services:' as check_type, COUNT(*) as count FROM services
UNION ALL
SELECT 'Bookings:' as check_type, COUNT(*) as count FROM bookings;

-- 3. Check bookings with details
SELECT 
  'Booking Details:' as check_type,
  b.customer_name,
  t.name as tenant,
  s.name as service,
  b.booking_date,
  b.status
FROM bookings b
LEFT JOIN tenants t ON t.id = b.tenant_id
LEFT JOIN services s ON s.id = b.service_id
ORDER BY b.created_at DESC
LIMIT 5;

-- 4. Check for orphaned bookings
SELECT 
  'Orphaned Bookings:' as check_type,
  b.id,
  b.customer_name,
  CASE WHEN t.id IS NULL THEN 'Missing Tenant' ELSE 'OK' END as tenant_status,
  CASE WHEN s.id IS NULL THEN 'Missing Service' ELSE 'OK' END as service_status
FROM bookings b
LEFT JOIN tenants t ON t.id = b.tenant_id
LEFT JOIN services s ON s.id = b.service_id
WHERE t.id IS NULL OR s.id IS NULL;
```

## Still Not Working?

### Check the exact tenant ID you're using:

1. Go to `/admin/tenants`
2. Click 📅 on Christelle's salon
3. Look at the URL: `/admin/{THIS_IS_THE_TENANT_ID}/bookings`
4. Copy that tenant ID

### Then run this in Supabase:

```sql
-- Replace with your actual tenant ID
SELECT 
  b.*,
  s.name as service_name,
  t.name as tenant_name
FROM bookings b
LEFT JOIN services s ON s.id = b.service_id
LEFT JOIN tenants t ON t.id = b.tenant_id
WHERE b.tenant_id = 'PASTE_TENANT_ID_HERE';
```

If this returns data, the issue is in the frontend.
If this returns nothing, the booking wasn't created with the correct tenant_id.

## Contact for Help

If still not working, provide:
1. Browser console logs
2. Network tab response
3. Result of SQL queries above
4. Tenant ID you're using

