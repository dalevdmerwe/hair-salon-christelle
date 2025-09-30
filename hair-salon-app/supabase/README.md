# 🗄️ Database Setup Guide

## 🚀 Quick Start (Fresh Database)

### Run This One Script:

**File:** `FRESH_DATABASE_SETUP.sql`

1. **Open Supabase Dashboard** → SQL Editor
2. **Copy entire contents** of `FRESH_DATABASE_SETUP.sql`
3. **Paste and Run**
4. **Done!** ✅

This creates everything from scratch:
- ✅ Tenants table
- ✅ Services table
- ✅ Storage bucket for images
- ✅ RLS policies
- ✅ Indexes for performance
- ✅ Sample data (Christelle's salon + 10 services)

---

## 📊 Database Schema

### Tenants Table

```sql
CREATE TABLE tenants (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
);
```

**Indexes:**
- `idx_tenants_slug` - Fast lookup by slug
- `idx_tenants_active` - Filter active tenants

**Features:**
- Auto-generated UUID primary key
- Unique slug for URL-friendly identifiers
- Automatic timestamps (created_at, updated_at)
- Soft delete with is_active flag

---

### Services Table

```sql
CREATE TABLE services (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  duration INTEGER NOT NULL, -- minutes
  price DECIMAL(10, 2) NOT NULL, -- ZAR
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
);
```

**Indexes:**
- `idx_services_tenant_id` - Fast lookup by tenant
- `idx_services_active` - Filter active services
- `idx_services_tenant_active` - Combined filter

**Features:**
- Foreign key to tenants with CASCADE DELETE
- Nullable tenant_id for global templates (optional)
- Automatic timestamps
- Soft delete with is_active flag

---

### Storage Bucket

**Bucket:** `tenant-images`
- **Public:** Yes (for development)
- **Purpose:** Store tenant logos/images

**Policies:**
- Public read access
- Public upload (restrict in production)
- Public update (restrict in production)
- Public delete (restrict in production)

---

## 📋 Sample Data

### Christelle's Hair Salon

**Tenant:**
- Name: Christelle's Hair Salon
- Slug: `christelles-salon`
- Description: Professional hair care services in South Africa
- Email: info@christelle.co.za
- Phone: +27 XX XXX XXXX
- Address: Cape Town, South Africa

**Services (10):**
1. Haircut - Women (60 min, R250)
2. Haircut - Men (30 min, R150)
3. Hair Coloring (120 min, R600)
4. Highlights (90 min, R450)
5. Blow Dry (45 min, R200)
6. Hair Treatment (45 min, R300)
7. Updo (90 min, R400)
8. Balayage (150 min, R800)
9. Keratin Treatment (180 min, R1200)
10. Hair Extensions (240 min, R2500)

---

## 🔄 Starting Fresh

If you want to completely reset the database:

1. **Uncomment the cleanup section** in `FRESH_DATABASE_SETUP.sql`:

```sql
-- Uncomment these lines:
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS tenants CASCADE;
DROP POLICY IF EXISTS "Public Access to Tenant Images" ON storage.objects;
-- ... etc
```

2. **Run the script**
3. **Everything will be recreated from scratch**

---

## 🔐 Security Notes

### Current Setup (Development)

⚠️ **Public access enabled** for easy development:
- Anyone can read/write tenants
- Anyone can read/write services
- Anyone can upload images

### For Production

Update RLS policies to require authentication:

```sql
-- Example: Restrict tenant updates to authenticated users
DROP POLICY "Allow public update tenants" ON tenants;

CREATE POLICY "Authenticated users can update tenants"
  ON tenants FOR UPDATE
  TO authenticated
  USING (auth.uid() IN (
    SELECT user_id FROM user_tenants WHERE tenant_id = tenants.id
  ));
```

---

## 📁 File Structure

```
supabase/
├── FRESH_DATABASE_SETUP.sql       ← Run this one!
├── README.md                      ← You are here
├── COMPLETE_SETUP.sql             ← Alternative (image_url only)
├── complete_image_setup.sql       ← Alternative
├── setup_storage.sql              ← Storage only
├── quick_fix_add_tenant_support.sql
└── migrations/
    ├── 20250930_001_create_tenants.sql
    ├── 20250930_002_create_services.sql
    ├── 20250930_003_add_tenant_id_to_services.sql
    ├── 20250930_004_add_image_url_to_tenants.sql
    └── run_all_migrations.sql
```

**Recommendation:** Use `FRESH_DATABASE_SETUP.sql` for a clean start.

---

## ✅ Verification

After running the script, you should see:

```
✅ Tenants Table Columns: id, name, slug, description, email, phone, address, image_url, is_active, created_at, updated_at
✅ Services Table Columns: id, tenant_id, name, description, duration, price, is_active, created_at, updated_at
✅ Storage Bucket: tenant-images (public: true)
✅ Tenants: Christelle's Hair Salon (christelles-salon)
✅ Services per Tenant: Christelle's Hair Salon: 10 services
🎉 SUCCESS! Database setup complete!
```

---

## 🐛 Troubleshooting

### "relation already exists"

**Solution:** The tables already exist. Either:
1. Uncomment the cleanup section to drop and recreate
2. Or skip the CREATE TABLE statements

### "policy already exists"

**Solution:** The script drops policies before creating them, so this shouldn't happen. If it does, manually drop the policy in Supabase.

### Storage bucket not created

**Check:**
1. Go to Supabase Dashboard → Storage
2. Verify "tenant-images" bucket exists
3. Check it's marked as "Public"

---

## 🎯 Next Steps

After running the database setup:

1. **Upload tenant image:**
   - Go to `/admin/tenants`
   - Edit Christelle's salon
   - Upload a logo/image

2. **Customize services:**
   - Go to `/admin/{tenantId}/services`
   - Edit, add, or remove services

3. **Add more tenants:**
   - Go to `/admin/tenants`
   - Click "Add New Tenant"

4. **Deploy to production:**
   - See `DEPLOYMENT.md`
   - Update RLS policies for security

---

## 📖 Additional Resources

- **Multi-Tenant Guide:** `../MULTI_TENANT_GUIDE.md`
- **Tenant Architecture:** `../TENANT_ARCHITECTURE.md`
- **Image Upload Guide:** `../IMAGE_UPLOAD_GUIDE.md`
- **Deployment Guide:** `../DEPLOYMENT.md`

---

## 🎉 Summary

**One script does it all:**
- ✅ Creates tables
- ✅ Sets up indexes
- ✅ Configures RLS policies
- ✅ Creates storage bucket
- ✅ Inserts sample data
- ✅ Verifies everything

**Just run `FRESH_DATABASE_SETUP.sql` and you're ready!** 🚀

