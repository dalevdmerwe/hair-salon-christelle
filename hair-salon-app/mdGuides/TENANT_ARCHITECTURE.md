# 🏗️ Multi-Tenant Architecture Guide

## Overview

The application uses a **flexible multi-tenant architecture** where services can be:
1. **Global Templates** (tenant_id = NULL) - Shared service templates
2. **Tenant-Specific** (tenant_id = UUID) - Custom services for each tenant

## Architecture Design

### Option Chosen: Hybrid Model

```
┌─────────────────────────────────────────┐
│         Services Table                   │
├─────────────────────────────────────────┤
│ tenant_id │ name          │ price       │
├───────────┼───────────────┼─────────────┤
│ NULL      │ Haircut Women │ R250 (template)
│ NULL      │ Haircut Men   │ R150 (template)
│ abc-123   │ Blow wave     │ R115 (Christelle's)
│ abc-123   │ Gent Cut      │ R140 (Christelle's)
│ xyz-789   │ Haircut Women │ R300 (Another salon)
└───────────┴───────────────┴─────────────┘
```

### Benefits:

✅ **Global Templates** - New tenants can copy from templates
✅ **Custom Pricing** - Each tenant sets their own prices
✅ **Flexibility** - Tenants can add unique services
✅ **Easy Onboarding** - Quick setup for new tenants

## Database Schema

### Tenants Table

```sql
CREATE TABLE tenants (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,  -- URL-friendly (e.g., 'christelles-salon')
  description TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Services Table

```sql
CREATE TABLE services (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,  -- NULL = global template
  name TEXT NOT NULL,
  description TEXT,
  duration INTEGER NOT NULL,  -- minutes
  price DECIMAL(10, 2) NOT NULL,  -- ZAR
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Key Points:

- **tenant_id is NULLABLE** - NULL means it's a global template
- **CASCADE DELETE** - Deleting a tenant deletes their services
- **No cascade for templates** - Global templates (NULL) are never deleted

## How It Works

### 1. Global Service Templates

These are "starter" services that any tenant can use as a reference:

```typescript
// Query global templates
serviceService.getAllServices(null)  // Returns services where tenant_id IS NULL
```

**Use Cases:**
- New tenant onboarding
- Standard service catalog
- Pricing guidelines

### 2. Tenant-Specific Services

Each tenant has their own services with custom pricing:

```typescript
// Query tenant's services
serviceService.getAllServices(tenantId)  // Returns services for specific tenant
```

**Use Cases:**
- Custom service offerings
- Tenant-specific pricing
- Unique services per salon

### 3. Creating Services

When creating a service, you specify the tenant:

```typescript
// Create tenant-specific service
serviceService.createService(serviceData, tenantId)

// Create global template (admin only)
serviceService.createService(serviceData, null)
```

## URL Structure

```
/admin/tenants                    → List all tenants
/admin/{tenantId}/services        → Manage services for specific tenant
/admin/templates                  → Manage global service templates (future)
```

## Querying Services

### Get All Services for a Tenant

```typescript
// In admin component
this.serviceService.getAllServices(this.tenantId).subscribe(services => {
  // Returns only services where tenant_id = this.tenantId
});
```

### Get Global Templates

```typescript
// For template management (future feature)
this.serviceService.getAllServices(null).subscribe(templates => {
  // Returns only services where tenant_id IS NULL
});
```

### Get All Services (Super Admin)

```typescript
// No filter - returns everything
this.serviceService.getAllServices().subscribe(allServices => {
  // Returns all services (templates + all tenants)
});
```

## Migration Strategy

### If Starting Fresh:

Run: `supabase/migrations/run_all_migrations.sql`

This creates:
- Tenants table
- Services table with tenant_id
- Sample tenant (Christelle's salon)
- Global templates
- Tenant-specific services

### If You Already Have Services:

Run: `supabase/quick_fix_add_tenant_support.sql`

This:
1. Creates tenants table
2. Adds tenant_id column to existing services
3. Assigns existing services to Christelle's salon
4. Adds global templates

## Data Flow

### Creating a New Tenant

```
1. User creates tenant in /admin/tenants
   ↓
2. Tenant record created with unique slug
   ↓
3. User clicks 📋 to manage services
   ↓
4. Navigates to /admin/{tenantId}/services
   ↓
5. User creates services (tenant_id = tenantId)
```

### Service Isolation

```
Tenant A Services (tenant_id = 'aaa')
  ├─ Haircut - R200
  ├─ Coloring - R500
  └─ Blow Dry - R150

Tenant B Services (tenant_id = 'bbb')
  ├─ Haircut - R250
  ├─ Highlights - R600
  └─ Treatment - R300

Global Templates (tenant_id = NULL)
  ├─ Haircut - Women - R250
  ├─ Haircut - Men - R150
  └─ Hair Coloring - R600
```

## Future Enhancements

### 1. Copy from Templates

Allow tenants to copy global templates:

```typescript
copyTemplateToTenant(templateId: string, tenantId: string) {
  // Copy global template and assign to tenant
}
```

### 2. Service Categories

Add categories for better organization:

```sql
ALTER TABLE services ADD COLUMN category TEXT;
```

### 3. Service Variants

Allow multiple pricing tiers:

```sql
CREATE TABLE service_variants (
  id UUID PRIMARY KEY,
  service_id UUID REFERENCES services(id),
  name TEXT,  -- e.g., "Short Hair", "Long Hair"
  price DECIMAL(10, 2)
);
```

### 4. Template Management UI

Create `/admin/templates` page to manage global templates.

## Security Considerations

### Current (Development):

- ⚠️ Public access to all CRUD operations
- ⚠️ No authentication required
- ⚠️ Any tenant can see any service

### Production Requirements:

1. **Authentication** - Require login
2. **Authorization** - Check user permissions
3. **RLS Policies** - Restrict by tenant

Example production RLS:

```sql
-- Users can only see their tenant's services
CREATE POLICY "tenant_isolation"
  ON services
  FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_tenants 
      WHERE user_id = auth.uid()
    )
    OR tenant_id IS NULL  -- Allow viewing templates
  );
```

## Troubleshooting

### "column tenant_id does not exist"

**Solution:** Run `quick_fix_add_tenant_support.sql`

### Services not showing for tenant

**Check:**
1. Services have correct tenant_id
2. Query is filtering by tenant_id
3. RLS policies allow access

### Can't create service

**Check:**
1. tenant_id is being passed correctly
2. Tenant exists in database
3. RLS policies allow INSERT

## Best Practices

1. **Always specify tenant_id** when creating services (unless creating templates)
2. **Filter by tenant_id** when querying services for a specific tenant
3. **Use NULL for templates** only - not for "unassigned" services
4. **Validate tenant exists** before creating services
5. **Test isolation** - ensure tenants can't see each other's data

## Example Queries

### Get tenant's services:
```sql
SELECT * FROM services 
WHERE tenant_id = 'abc-123' 
AND is_active = true;
```

### Get global templates:
```sql
SELECT * FROM services 
WHERE tenant_id IS NULL 
AND is_active = true;
```

### Count services per tenant:
```sql
SELECT 
  t.name,
  COUNT(s.id) as service_count
FROM tenants t
LEFT JOIN services s ON s.tenant_id = t.id
GROUP BY t.name;
```

## Summary

✅ **Flexible** - Supports templates and custom services
✅ **Isolated** - Each tenant's data is separate
✅ **Scalable** - Easy to add new tenants
✅ **Simple** - One services table, nullable foreign key

The architecture allows you to:
- Quickly onboard new tenants with templates
- Let each tenant customize their services
- Maintain a standard service catalog
- Scale to many tenants efficiently

