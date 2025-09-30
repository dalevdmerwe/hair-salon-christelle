# 🔧 Admin Panel Guide

## ✅ What's Been Created

I've built a complete admin panel for managing your hair salon services with full CRUD functionality!

### Features:
- ✅ **View all services** in a table format
- ✅ **Create new services** with a modal form
- ✅ **Edit existing services** 
- ✅ **Delete services** with confirmation
- ✅ **Toggle active/inactive status** for services
- ✅ **Responsive design** - works on mobile and desktop
- ✅ **Real-time updates** from Supabase database

## 🚀 How to Access

### 1. Start the Development Server
```bash
cd hair-salon-app
npm start
```

### 2. Navigate to Admin Panel
Open your browser and go to:
```
http://localhost:4200/admin
```

Or click the **"🔧 Admin"** link in the top navigation bar on the home page.

## 📋 Using the Admin Panel

### View Services
- All services are displayed in a table
- Shows: Name, Description, Duration, Price, Status
- Active services have a green badge
- Inactive services have a red badge and are slightly faded

### Create a New Service
1. Click **"➕ Add New Service"** button
2. Fill in the form:
   - **Service Name** (required) - e.g., "Haircut - Women"
   - **Description** (optional) - Brief description
   - **Duration** (required) - In minutes (e.g., 60)
   - **Price** (required) - In ZAR (e.g., 250)
   - **Active** (checkbox) - Check to make visible to customers
3. Click **"Create Service"**

### Edit a Service
1. Click the **✏️ (edit)** icon next to any service
2. Modify the fields you want to change
3. Click **"Update Service"**

### Toggle Active/Inactive
1. Click the **👁️ (eye)** or **🚫 (disabled)** icon
2. Service status will toggle immediately
3. Inactive services won't show on the public home page

### Delete a Service
1. Click the **🗑️ (trash)** icon
2. Confirm the deletion in the popup
3. Service will be permanently deleted

## 🗄️ Database Setup

### Important: Update Your Supabase Policies

The SQL script has been updated with new policies. You need to run this in Supabase:

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Run the updated `supabase-setup.sql` file

Or run these policies manually:

```sql
-- Allow public CRUD operations (for development)
-- In production, restrict these to authenticated admin users

CREATE POLICY "Allow public read all services"
  ON services FOR SELECT USING (true);

CREATE POLICY "Allow public insert services"
  ON services FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update services"
  ON services FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow public delete services"
  ON services FOR DELETE USING (true);
```

### ⚠️ Security Note

**Current Setup (Development):**
- Anyone can access the admin panel
- No authentication required
- Suitable for development/testing only

**For Production:**
You should add:
1. **Authentication** - Require login to access `/admin`
2. **Authorization** - Check if user has admin role
3. **RLS Policies** - Restrict database operations to admin users only

## 🎨 Admin Panel Features

### Table View
- **Sortable columns** (coming soon)
- **Search/filter** (coming soon)
- **Pagination** (coming soon)
- **Bulk actions** (coming soon)

### Form Validation
- Required fields are marked with *
- Duration must be at least 5 minutes
- Price must be 0 or greater
- Name cannot be empty

### User Experience
- **Modal forms** - Clean, focused editing experience
- **Confirmation dialogs** - Prevent accidental deletions
- **Loading states** - Shows when data is being fetched
- **Error handling** - Displays helpful error messages
- **Responsive design** - Works on all screen sizes

## 📱 Mobile Support

The admin panel is fully responsive:
- Table scrolls horizontally on small screens
- Form adapts to mobile layout
- Touch-friendly buttons and controls

## 🐛 Troubleshooting

### "Failed to load services"
- Check your Supabase credentials in `src/environments/environment.ts`
- Make sure you ran the SQL setup script
- Check browser console for detailed errors

### "Failed to create/update/delete service"
- Verify RLS policies are set up correctly
- Check Supabase logs for permission errors
- Ensure all required fields are filled

### Services not showing on home page
- Check if service is marked as "Active"
- Refresh the home page
- Check browser console for errors

## 🔐 Adding Authentication (Future)

To secure the admin panel in production:

1. **Add Supabase Auth**
2. **Create auth guard**
3. **Protect `/admin` route**
4. **Update RLS policies** to check for admin role
5. **Add login/logout UI**

Example auth guard (for future implementation):
```typescript
// auth.guard.ts
export const adminGuard: CanActivateFn = () => {
  const supabase = inject(SupabaseService);
  // Check if user is authenticated and has admin role
  return supabase.isAdmin();
};
```

## 📊 Service Data Structure

Each service has:
- **id** (UUID) - Auto-generated
- **name** (text) - Service name
- **description** (text) - Optional description
- **duration** (integer) - Duration in minutes
- **price** (decimal) - Price in ZAR
- **is_active** (boolean) - Visibility status
- **created_at** (timestamp) - When created
- **updated_at** (timestamp) - Last update time

## 🎉 You're All Set!

Your admin panel is ready to use! You can now:
- ✅ Manage all your services from one place
- ✅ Add new services as your business grows
- ✅ Update prices and durations easily
- ✅ Control which services are visible to customers

**Next Steps:**
1. Run the updated SQL script in Supabase
2. Start the dev server
3. Navigate to `/admin`
4. Start managing your services!

Enjoy your new admin panel! 🚀

