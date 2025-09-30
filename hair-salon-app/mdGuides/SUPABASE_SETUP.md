# 🗄️ Supabase Setup Guide

## ✅ You've Already Done:
- Created Supabase account
- Added your Supabase URL and API key to `src/environments/environment.ts`

## 📋 Next Steps:

### 1. Create the Database Table

1. Go to your Supabase project: https://supabase.com/dashboard
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire contents of `supabase-setup.sql` file
5. Paste it into the SQL editor
6. Click **Run** (or press Ctrl+Enter)

This will:
- ✅ Create the `services` table
- ✅ Set up Row Level Security (RLS) policies
- ✅ Insert 11 sample services from your services.json
- ✅ Create indexes for better performance
- ✅ Set up automatic `updated_at` timestamp

### 2. Verify the Data

After running the SQL, you should see a result showing all the inserted services.

You can also check:
1. Go to **Table Editor** in the left sidebar
2. Click on the `services` table
3. You should see 11 services listed

### 3. Test the Connection

1. Start your Angular app:
   ```bash
   cd hair-salon-app
   npm start
   ```

2. Open http://localhost:4200 in your browser

3. The home page should now load services from Supabase!

## 🔍 Troubleshooting

### If services don't load:

1. **Check the browser console** (F12) for errors
2. **Verify your credentials** in `src/environments/environment.ts`
3. **Check Supabase logs**:
   - Go to your Supabase dashboard
   - Click **Logs** in the left sidebar
   - Look for any errors

### Common Issues:

**Error: "Invalid API key"**
- Make sure you copied the **anon/public** key, not the service_role key
- The key should start with `eyJ...`

**Error: "Row Level Security policy violation"**
- Make sure you ran the SQL script that creates the RLS policies
- The policies allow public read access to active services

**No services showing:**
- Check if `is_active` is set to `true` for your services
- Open browser console and look for error messages

## 📊 Database Schema

### Services Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key (auto-generated) |
| `name` | TEXT | Service name |
| `description` | TEXT | Service description (optional) |
| `duration` | INTEGER | Duration in minutes |
| `price` | DECIMAL | Price in ZAR |
| `is_active` | BOOLEAN | Whether service is active |
| `created_at` | TIMESTAMP | When service was created |
| `updated_at` | TIMESTAMP | When service was last updated |

## 🔐 Security

The app uses Row Level Security (RLS) policies:

- **Public users** can read active services (`is_active = true`)
- **Authenticated users** can read all services
- Only admins (via service_role key) can insert/update/delete

## 🚀 Next Steps

Once services are loading from Supabase:

1. **Add more services** - Use the Table Editor or insert via SQL
2. **Create booking system** - Add bookings table
3. **Add authentication** - Allow users to create accounts
4. **Build admin dashboard** - Manage services and bookings

## 📝 Sample Services Included

The SQL script includes these services:
1. Blow wave (45 min, R115)
2. Cut & Blowwave (45 min, R275)
3. Gent Cut (30 min, R140)
4. Cut only no Blow wave (30 min, R265)
5. Boys (30 min, R70)
6. Girls (30 min, R70)
7. Fringe cut (15 min, R60)
8. Student Cut with Blow wave (45 min, R300)
9. Straight Top & Cut (60 min, R465)
10. Foil (60 min, R265)
11. Style (60 min, R225)

You can edit these or add more services directly in the Supabase Table Editor!

## 🎉 You're All Set!

Once you run the SQL script, your app will be connected to a real database and ready to scale!

