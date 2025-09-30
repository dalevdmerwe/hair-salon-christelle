# 📷 Image Upload Feature Guide

## ✅ What's Been Added

I've added image upload functionality for tenant logos/profile images!

### Features:

- ✅ **Upload images** when creating/editing tenants
- ✅ **Image preview** before saving
- ✅ **Remove image** option
- ✅ **File validation** (type and size)
- ✅ **Display logos** in tenant table
- ✅ **Supabase Storage** integration

---

## 🗄️ Database Setup

### Step 1: Add image_url Column

Run this in **Supabase SQL Editor**:

```sql
-- Add image_url column to tenants table
ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS image_url TEXT;
```

Or run the migration file:
```
supabase/migrations/20250930_004_add_image_url_to_tenants.sql
```

### Step 2: Create Storage Bucket

Run this in **Supabase SQL Editor**:

```sql
-- Create storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('tenant-images', 'tenant-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up policies
CREATE POLICY "Public Access to Tenant Images"
ON storage.objects FOR SELECT
USING (bucket_id = 'tenant-images');

CREATE POLICY "Public Upload to Tenant Images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'tenant-images');
```

Or run the setup file:
```
supabase/setup_storage.sql
```

### Step 3: Verify Setup

1. Go to **Supabase Dashboard** → **Storage**
2. You should see a bucket called **"tenant-images"**
3. It should be marked as **Public**

---

## 🎨 How It Works

### In the Tenant Form:

1. **Click "Add New Tenant"** or **Edit existing tenant**
2. **See "Logo / Image" field** in the form
3. **Click "📷 Choose Image"** button
4. **Select an image** (PNG, JPG, GIF up to 5MB)
5. **Preview appears** with remove button (✕)
6. **Click "Create/Update Tenant"**
7. **Image uploads** to Supabase Storage
8. **URL saved** to database

### In the Tenant Table:

- **Logo column** shows tenant images
- **Thumbnail** (50x50px) with rounded corners
- **Placeholder** (📷) if no image

---

## 📋 File Validation

### Accepted Formats:
- PNG
- JPG/JPEG
- GIF
- WebP
- SVG

### Size Limit:
- Maximum: **5MB**

### Validation Messages:
- "Please select an image file" - if non-image selected
- "Image size must be less than 5MB" - if file too large

---

## 🔧 Technical Details

### Upload Flow:

```
1. User selects file
   ↓
2. Validate file type and size
   ↓
3. Create preview (FileReader)
   ↓
4. User clicks Save
   ↓
5. Upload to Supabase Storage
   ↓
6. Get public URL
   ↓
7. Save URL to database
   ↓
8. Display in table
```

### File Naming:

Images are stored as:
```
tenants/{slug}-{timestamp}.{extension}
```

Example:
```
tenants/christelles-salon-1735567890123.jpg
```

### Storage Structure:

```
tenant-images/
  └── tenants/
      ├── christelles-salon-1735567890123.jpg
      ├── another-salon-1735567890456.png
      └── ...
```

---

## 🎯 Usage Examples

### Create Tenant with Image:

1. Click "Add New Tenant"
2. Fill in name: "Christelle's Hair Salon"
3. Slug auto-generates: "christelles-hair-salon"
4. Click "Choose Image"
5. Select logo file
6. Preview appears
7. Click "Create Tenant"
8. Image uploads and tenant is created

### Update Tenant Image:

1. Click ✏️ (edit) on existing tenant
2. Current image shows in preview
3. Click "Choose Image" to change
4. Or click ✕ to remove current image
5. Click "Update Tenant"

### Remove Image:

1. Edit tenant
2. Click ✕ on image preview
3. Image removed from preview
4. Click "Update Tenant"
5. Image URL cleared in database

---

## 🔐 Security Notes

### Current Setup (Development):

⚠️ **Public upload enabled** - Anyone can upload images

### For Production:

Update storage policies to require authentication:

```sql
-- Remove public upload policy
DROP POLICY "Public Upload to Tenant Images" ON storage.objects;

-- Add authenticated upload policy
CREATE POLICY "Authenticated Upload to Tenant Images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'tenant-images' AND
  auth.role() = 'authenticated'
);
```

---

## 🐛 Troubleshooting

### "Failed to upload image"

**Possible causes:**
1. Storage bucket doesn't exist
2. Storage policies not set up
3. Network error

**Solutions:**
1. Run `setup_storage.sql`
2. Check Supabase Dashboard → Storage
3. Check browser console for errors

### Image doesn't display

**Possible causes:**
1. URL not saved to database
2. Image deleted from storage
3. CORS issue

**Solutions:**
1. Check `image_url` column in database
2. Verify file exists in Storage
3. Check Supabase allowed origins

### "Please select an image file"

**Cause:** Selected file is not an image

**Solution:** Select PNG, JPG, GIF, or WebP file

### "Image size must be less than 5MB"

**Cause:** File is too large

**Solution:** 
1. Compress image
2. Use smaller resolution
3. Or increase limit in code

---

## 🎨 Customization

### Change Size Limit:

In `tenants.component.ts`:

```typescript
// Change from 5MB to 10MB
if (file.size > 10 * 1024 * 1024) {
  alert('Image size must be less than 10MB');
  return;
}
```

### Change Accepted Formats:

In `tenants.component.html`:

```html
<!-- Accept only PNG and JPG -->
<input 
  type="file" 
  accept="image/png,image/jpeg"
  ...
>
```

### Change Thumbnail Size:

In `tenants.component.scss`:

```scss
.tenant-logo-img {
  width: 80px;   // Change from 50px
  height: 80px;  // Change from 50px
  ...
}
```

---

## 📊 Storage Costs

### Supabase Free Tier:
- ✅ **1GB storage** included
- ✅ **2GB bandwidth/month**

### Estimated Usage:
- Average image: **200KB**
- 1GB = **~5,000 images**
- More than enough for most use cases!

---

## 🚀 Next Steps

1. **Run the SQL scripts:**
   - `20250930_004_add_image_url_to_tenants.sql`
   - `setup_storage.sql`

2. **Test the feature:**
   - Create a new tenant with image
   - Edit existing tenant and add image
   - Remove image from tenant

3. **Production:**
   - Update storage policies for authentication
   - Add image optimization
   - Consider CDN for faster loading

---

## ✅ Summary

You now have:
- ✅ Image upload in tenant form
- ✅ Image preview before saving
- ✅ Image display in tenant table
- ✅ File validation
- ✅ Supabase Storage integration

**Just run the SQL scripts and you're ready to upload images!** 📷🎉

