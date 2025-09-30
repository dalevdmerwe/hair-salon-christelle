# Supabase Migrations

This folder contains versioned database migration scripts for the hair salon application.

## Migration Files

Migrations are numbered and should be run in order:

1. **20250930_001_create_tenants.sql** - Creates the tenants table with RLS policies
2. **20250930_002_create_services.sql** - Creates the services table with tenant relationship

## How to Run Migrations

### Option 1: Using Supabase CLI (Recommended)

If you have Supabase CLI installed:

```bash
# Initialize Supabase in your project (first time only)
supabase init

# Link to your remote project
supabase link --project-ref ukcxattnpsvviqsbfaem

# Run all pending migrations
supabase db push
```

### Option 2: Manual Execution in Supabase Dashboard

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Click **New Query**
3. Copy the contents of each migration file **in order**
4. Paste and click **Run**
5. Repeat for each migration file

**Important:** Run migrations in numerical order!

### Option 3: Run All Migrations at Once

You can also run the combined script:

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Copy the contents of `run_all_migrations.sql`
3. Paste and click **Run**

## Migration Naming Convention

Format: `YYYYMMDD_NNN_description.sql`

- `YYYYMMDD` - Date (e.g., 20250930)
- `NNN` - Sequential number (001, 002, etc.)
- `description` - Brief description (e.g., create_tenants)

## Creating New Migrations

When adding new migrations:

1. Create a new file with the next sequential number
2. Use the naming convention above
3. Include rollback instructions in comments if needed
4. Test locally before running in production

Example:
```sql
-- Migration: Add booking table
-- Created: 2025-09-30
-- Description: Create bookings table for appointments

-- Rollback: DROP TABLE IF EXISTS bookings CASCADE;

CREATE TABLE bookings (
  ...
);
```

## Database Schema

### Current Tables:

1. **tenants** - Multi-tenant support
   - Stores salon/business information
   - Each tenant has unique slug for URLs

2. **services** - Service offerings
   - Linked to tenants via `tenant_id`
   - Cascade delete when tenant is deleted

### Relationships:

```
tenants (1) ──< (many) services
```

## RLS Policies

All tables have Row Level Security (RLS) enabled with public access policies for development.

**⚠️ Production Warning:**
Current policies allow public CRUD access. Before deploying to production:
1. Add authentication
2. Update RLS policies to check user permissions
3. Restrict access based on user roles

## Rollback Instructions

If you need to rollback migrations:

### Rollback services table:
```sql
DROP TABLE IF EXISTS services CASCADE;
```

### Rollback tenants table:
```sql
DROP TABLE IF EXISTS tenants CASCADE;
```

### Rollback everything:
```sql
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS tenants CASCADE;
DROP FUNCTION IF EXISTS update_services_updated_at_column CASCADE;
DROP FUNCTION IF EXISTS update_tenants_updated_at_column CASCADE;
```

## Verification

After running migrations, verify the setup:

```sql
-- Check tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('tenants', 'services');

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('tenants', 'services');

-- Check policies
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('tenants', 'services');

-- Check data
SELECT COUNT(*) as tenant_count FROM tenants;
SELECT COUNT(*) as service_count FROM services;
```

## Troubleshooting

### "relation already exists"
- The table was already created
- Safe to ignore if using `IF NOT EXISTS`
- Or drop the table and re-run

### "policy already exists"
- Drop existing policies first
- Or use `DROP POLICY IF EXISTS` before creating

### "permission denied"
- Check you're using the correct API key
- Verify RLS policies are set up correctly
- Check Supabase logs for details

## Next Migrations

Future migrations might include:

- `003_create_bookings.sql` - Booking/appointment system
- `004_create_users.sql` - User management
- `005_add_authentication.sql` - Auth integration
- `006_create_notifications.sql` - SMS/WhatsApp notifications
- `007_add_payment_tracking.sql` - Payment records

## Best Practices

1. **Always backup** before running migrations in production
2. **Test locally** or in a staging environment first
3. **Run migrations in order** - don't skip numbers
4. **Document changes** - add comments explaining why
5. **Include rollback** - document how to undo changes
6. **Version control** - commit migrations to git
7. **One change per migration** - easier to debug and rollback

## Resources

- [Supabase Migrations Docs](https://supabase.com/docs/guides/cli/local-development#database-migrations)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

