# 🏢 Multi-Tenant System Guide

## ✅ What's Been Created

I've built a complete multi-tenant system for your hair salon application!

### Features:

1. **Tenant Management** (`/admin/tenants`)
   - Create, Read, Update, Delete tenants
   - Each tenant represents a salon/business
   - URL-friendly slugs for each tenant
   - Contact information (email, phone, address)
   - Active/inactive status

2. **Tenant-Specific Services** (`/admin/{tenantId}/services`)
   - Each tenant has their own services
   - Services are isolated per tenant
   - Full CRUD operations per tenant

### Route Structure:

```
/                           → Home page
/admin                      → Redirects to /admin/tenants
/admin/tenants              → Tenant management (CRUD)
/admin/{tenantId}/services  → Service management for specific tenant
```

## 🗄️ Database Setup

### Step 1: Run the Tenants SQL Script

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Copy the contents of **`tenants-setup.sql`**
3. Paste and click **Run**

This will:
- ✅ Create the `tenants` table
- ✅ Add `tenant_id` column to `services` table
- ✅ Set up RLS policies
- ✅ Create indexes for performance
- ✅ Insert a sample tenant (Christelle's salon)
- ✅ Set up foreign key relationship (services → tenants)

### Step 2: Verify the Setup

After running the script, you should see:
- A new `tenants` table in Table Editor
- One sample tenant: "Christelle's Hair Salon"
- The `services` table now has a `tenant_id` column

## 🚀 How to Use

### 1. Manage Tenants

**Access:** `http://localhost:4200/admin/tenants`

**Actions:**
- **Create Tenant:**
  - Click "➕ Add New Tenant"
  - Fill in name (e.g., "Christelle's Hair Salon")
  - Slug auto-generates from name (e.g., "christelles-hair-salon")
  - Add optional contact info
  - Click "Create Tenant"

- **Edit Tenant:**
  - Click ✏️ icon
  - Update any fields
  - Click "Update Tenant"

- **Manage Services:**
  - Click 📋 icon
  - Takes you to `/admin/{tenantId}/services`

- **Toggle Active/Inactive:**
  - Click 👁️ or 🚫 icon
  - Inactive tenants can't be accessed

- **Delete Tenant:**
  - Click 🗑️ icon
  - Confirms deletion
  - **Warning:** This also deletes all associated services!

### 2. Manage Services for a Tenant

**Access:** Click 📋 icon from tenant list, or go to `/admin/{tenantId}/services`

**Features:**
- Shows tenant name at the top
- "← Back to Tenants" breadcrumb
- All service CRUD operations (same as before)
- Services are automatically linked to the tenant

## 📊 Data Structure

### Tenants Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `name` | TEXT | Tenant name |
| `slug` | TEXT | URL-friendly identifier (unique) |
| `description` | TEXT | Optional description |
| `email` | TEXT | Contact email |
| `phone` | TEXT | Contact phone |
| `address` | TEXT | Physical address |
| `is_active` | BOOLEAN | Active status |
| `created_at` | TIMESTAMP | Creation time |
| `updated_at` | TIMESTAMP | Last update time |

### Services Table (Updated)

Now includes:
- `tenant_id` (UUID) - Foreign key to tenants table
- **Cascade delete:** When a tenant is deleted, all their services are deleted too

## 🔄 Workflow Example

1. **Create a tenant:**
   - Go to `/admin/tenants`
   - Click "Add New Tenant"
   - Name: "Christelle's Hair Salon"
   - Slug: "christelles-salon" (auto-generated)
   - Save

2. **Add services for the tenant:**
   - Click 📋 icon next to the tenant
   - Click "Add New Service"
   - Add services (Haircut, Coloring, etc.)

3. **Manage multiple tenants:**
   - Each tenant has their own services
   - Services are isolated per tenant
   - Easy to switch between tenants

## 🎯 Benefits of Multi-Tenant Architecture

1. **Scalability:** Support multiple salons in one application
2. **Data Isolation:** Each tenant's data is separate
3. **Easy Management:** Manage all tenants from one dashboard
4. **Flexible:** Add/remove tenants without affecting others
5. **Professional:** Clean URL structure with tenant slugs

## 🔐 Security Notes

**Current Setup (Development):**
- Public access to all admin functions
- No authentication required

**For Production:**
You should add:
1. **Authentication** - Require login
2. **Authorization** - Check user permissions
3. **Tenant-specific access** - Users can only access their own tenant
4. **RLS policies** - Restrict database access by tenant

Example production RLS policy:
```sql
CREATE POLICY "Users can only access their tenant's services"
  ON services
  FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_tenants 
      WHERE user_id = auth.uid()
    )
  );
```

## 📁 Files Created

### Models:
- `src/app/core/models/tenant.model.ts` - Tenant interface

### Services:
- `src/app/core/services/tenant.service.ts` - Tenant CRUD operations

### Components:
- `src/app/pages/admin/tenants/tenants.component.ts` - Tenant management logic
- `src/app/pages/admin/tenants/tenants.component.html` - Tenant management UI
- `src/app/pages/admin/tenants/tenants.component.scss` - Tenant management styles

### Database:
- `tenants-setup.sql` - Database schema and setup

### Updated Files:
- `src/app/app.routes.ts` - Added tenant routes
- `src/app/pages/admin/admin.component.ts` - Added tenant context
- `src/app/pages/admin/admin.component.html` - Added breadcrumb and tenant info
- `src/app/pages/admin/admin.component.scss` - Added breadcrumb styles
- `src/app/pages/home/home.component.html` - Updated admin link

## 🐛 Troubleshooting

### "Tenant not found"
- Make sure you ran `tenants-setup.sql`
- Check that the tenant exists in the database
- Verify the tenant ID in the URL is correct

### Services not showing for tenant
- Check that services have `tenant_id` set
- Run the migration to add `tenant_id` column
- Verify RLS policies are correct

### Can't delete tenant
- Check for foreign key constraints
- Make sure cascade delete is set up
- Look at Supabase logs for errors

## 🚀 Next Steps

Once you've tested the multi-tenant system:

1. **Update service creation** - Auto-assign tenant_id when creating services
2. **Add tenant filtering** - Filter services by tenant in queries
3. **Add authentication** - Secure the admin panel
4. **Add user-tenant relationships** - Link users to specific tenants
5. **Add booking system** - Per-tenant bookings
6. **Add tenant branding** - Custom colors, logos per tenant

## 🎉 You're All Set!

Your multi-tenant system is ready! You can now:
- ✅ Manage multiple salons/businesses
- ✅ Each with their own services
- ✅ Clean, professional URL structure
- ✅ Easy to scale and maintain

**Start by running the `tenants-setup.sql` script in Supabase!**

