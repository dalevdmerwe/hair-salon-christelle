# 🔧 Troubleshooting Guide

## NavigatorLockAcquireTimeoutError

### Error Message:
```
NavigatorLockAcquireTimeoutError: Acquiring an exclusive Navigator LockManager lock 
"lock:sb-ukcxattnpsvviqsbfaem-auth-token" immediately failed
```

### What This Means:
Supabase Auth is trying to acquire a browser lock for session management, but it's timing out. This usually happens when you're not using authentication but Supabase still tries to manage sessions.

### ✅ Fix Applied:

I've updated the Supabase service to disable session persistence since we're not using authentication yet:

```typescript
createClient(url, key, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});
```

### 🔄 Steps to Apply the Fix:

1. **Stop the dev server** (Ctrl+C in terminal)
2. **Clear browser storage:**
   - Press F12 (open DevTools)
   - Go to **Application** tab
   - Click **Clear site data** button
   - Or manually delete items under **Local Storage** and **Session Storage**
3. **Restart the dev server:**
   ```bash
   npm start
   ```
4. **Refresh the browser** (Ctrl+Shift+R for hard refresh)

### Alternative Quick Fix:

If the error persists:

1. **Close all browser tabs** with localhost:4200
2. **Clear browser cache** (Ctrl+Shift+Delete)
3. **Open in incognito/private window**
4. Navigate to `http://localhost:4200/admin`

## Other Common Issues

### Issue: "Failed to load services"

**Possible Causes:**
- Supabase credentials are incorrect
- RLS policies not set up
- Network issues

**Solutions:**
1. Check `src/environments/environment.ts` has correct URL and key
2. Run the `add-admin-policies.sql` script in Supabase
3. Check browser console for detailed error messages
4. Verify Supabase project is active (not paused)

### Issue: "Failed to create/update/delete service"

**Possible Causes:**
- RLS policies missing or incorrect
- Invalid data format
- Network issues

**Solutions:**
1. Make sure you ran `add-admin-policies.sql`
2. Check all required fields are filled
3. Look at Supabase logs (Dashboard → Logs)
4. Verify the service_role key is NOT being used (use anon key)

### Issue: Services not showing on home page

**Possible Causes:**
- Services are marked as inactive
- Different RLS policy for public vs admin
- Data not saved properly

**Solutions:**
1. Check service status in admin panel (should be green "Active")
2. Toggle the active status
3. Refresh the home page
4. Check browser console for errors

### Issue: CORS errors

**Possible Causes:**
- Supabase URL is incorrect
- API key is invalid
- Project is paused

**Solutions:**
1. Verify Supabase URL in environment.ts
2. Check API key is the anon/public key
3. Go to Supabase dashboard and ensure project is active

## Browser Console Debugging

### How to Check Console:
1. Press **F12** (or right-click → Inspect)
2. Click **Console** tab
3. Look for red error messages

### Common Console Errors:

**"Invalid API key"**
- Solution: Copy the correct anon key from Supabase Settings → API

**"Failed to fetch"**
- Solution: Check internet connection and Supabase URL

**"Row Level Security policy violation"**
- Solution: Run the `add-admin-policies.sql` script

## Supabase Dashboard Checks

### Verify Your Setup:

1. **Check Table Exists:**
   - Dashboard → Table Editor
   - Look for `services` table
   - Should have columns: id, name, description, duration, price, is_active, created_at, updated_at

2. **Check Policies:**
   - Dashboard → Authentication → Policies
   - Select `services` table
   - Should see 4 policies (SELECT, INSERT, UPDATE, DELETE)

3. **Check Data:**
   - Dashboard → Table Editor → services
   - Should see your services listed
   - Try manually adding a row to test

4. **Check Logs:**
   - Dashboard → Logs
   - Look for errors or failed requests
   - Filter by "Error" level

## Network Issues

### Check API Requests:

1. Open **DevTools** (F12)
2. Go to **Network** tab
3. Refresh the page
4. Look for requests to `supabase.co`
5. Click on failed requests to see details

### What to Look For:
- **Status 200** = Success ✅
- **Status 401** = Authentication issue (check API key)
- **Status 403** = Permission denied (check RLS policies)
- **Status 404** = Not found (check URL)
- **Status 500** = Server error (check Supabase logs)

## Still Having Issues?

### Collect This Information:

1. **Error message** from browser console
2. **Network request** details (from Network tab)
3. **Supabase logs** (from Dashboard)
4. **Your environment.ts** (without exposing the full API key)

### Reset Everything:

If nothing works, try a fresh start:

1. **Drop and recreate the table:**
   ```sql
   DROP TABLE IF EXISTS services CASCADE;
   ```
   Then run `supabase-setup.sql` again

2. **Clear all browser data:**
   - Close all tabs
   - Clear cache and cookies
   - Restart browser

3. **Restart dev server:**
   ```bash
   npm start
   ```

## Getting Help

If you're still stuck:
1. Check the error message carefully
2. Search for the error on Google
3. Check Supabase documentation: https://supabase.com/docs
4. Check Angular documentation: https://angular.dev

## Prevention Tips

### For Future Development:

1. **Always check browser console** when something doesn't work
2. **Test in incognito mode** to rule out cache issues
3. **Keep Supabase dashboard open** to monitor logs
4. **Commit working code** to git before making changes
5. **Test one feature at a time** to isolate issues

---

**Most issues can be solved by:**
1. Clearing browser cache
2. Restarting the dev server
3. Checking the browser console
4. Verifying Supabase credentials

Good luck! 🚀

