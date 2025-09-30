# 🔧 Vercel Deployment Fix

## ❌ Problem

Getting 404 error on Vercel: `https://hair-salon-christelle.vercel.app/`

## ✅ Solution

The issue is that your Angular app is in the `hair-salon-app/` subdirectory, but Vercel is looking in the root.

### What I Fixed:

1. **Created `vercel.json` at root** with correct paths
2. **Updated build commands** to navigate to subdirectory
3. **Set correct output directory**

---

## 🚀 Steps to Fix

### Option 1: Push Changes (Recommended)

```bash
# Commit the new vercel.json
git add vercel.json README.md VERCEL_FIX.md
git commit -m "Fix Vercel deployment configuration"
git push origin main
```

Vercel will automatically redeploy with the correct configuration.

---

### Option 2: Configure in Vercel Dashboard

If you prefer to configure in Vercel Dashboard:

1. **Go to:** [Vercel Dashboard](https://vercel.com/dashboard)
2. **Select:** hair-salon-christelle project
3. **Go to:** Settings → General
4. **Set Root Directory:** `hair-salon-app`
5. **Go to:** Settings → Build & Development
6. **Set:**
   - Build Command: `npm run build`
   - Output Directory: `dist/hair-salon-app/browser`
   - Install Command: `npm install`
7. **Save** and **Redeploy**

---

## 📋 Correct Configuration

### Root `vercel.json`:

```json
{
  "buildCommand": "cd hair-salon-app && npm install && npm run build",
  "outputDirectory": "hair-salon-app/dist/hair-salon-app/browser",
  "installCommand": "cd hair-salon-app && npm install",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Why This Works:

- **buildCommand:** Navigates to `hair-salon-app/` and builds
- **outputDirectory:** Points to the built Angular app
- **installCommand:** Installs dependencies in subdirectory
- **rewrites:** Ensures SPA routing works (all routes → index.html)

---

## 🔍 Verify Deployment

After pushing or reconfiguring:

1. **Check Vercel Dashboard** → Deployments
2. **Wait for build** to complete (2-3 minutes)
3. **Check build logs** for errors
4. **Visit:** `https://hair-salon-christelle.vercel.app/`
5. **Should see:** Home page with hero section

---

## 🐛 Troubleshooting

### Build fails with "npm: command not found"

**Fix:** Vercel should auto-detect Node.js. If not, add to `vercel.json`:

```json
{
  "framework": null,
  "buildCommand": "cd hair-salon-app && npm install && npm run build"
}
```

### Still getting 404

**Check:**
1. Build completed successfully in Vercel dashboard
2. Output directory is correct: `hair-salon-app/dist/hair-salon-app/browser`
3. `index.html` exists in output directory

**Fix:** Check build logs in Vercel dashboard for errors

### Build succeeds but page is blank

**Check:**
1. Browser console for errors
2. Supabase environment variables are set
3. Base href is correct in Angular

**Fix:** Add environment variables in Vercel:
- Go to Settings → Environment Variables
- Add `SUPABASE_URL` and `SUPABASE_KEY`

---

## 📊 Expected Build Output

```
✓ Building...
✓ Installing dependencies...
✓ Running build command...
✓ Build completed
✓ Deploying...
✓ Deployment ready

Output Directory: hair-salon-app/dist/hair-salon-app/browser
Files:
  - index.html
  - main-*.js
  - polyfills-*.js
  - styles-*.css
  - assets/
```

---

## ✅ Success Checklist

After deployment:

- [ ] Build completes without errors
- [ ] Deployment shows "Ready"
- [ ] Visit URL shows home page
- [ ] Hero section displays
- [ ] Services load
- [ ] Admin link works
- [ ] No console errors

---

## 🎯 Next Steps

Once deployment works:

1. **Upload tenant image** via `/admin/tenants`
2. **Verify hero background** shows on home page
3. **Test all routes** (home, admin, services)
4. **Check mobile responsiveness**
5. **Set up custom domain** (optional)

---

## 📞 Quick Commands

```bash
# Push changes to trigger redeploy
git add .
git commit -m "Fix Vercel deployment"
git push origin main

# Check deployment status
# Go to: https://vercel.com/dalevdmerwe/hair-salon-christelle

# View live site
# Go to: https://hair-salon-christelle.vercel.app/
```

---

## 🎉 Summary

**Problem:** 404 error because Vercel couldn't find the app

**Solution:** Created `vercel.json` at root with correct paths

**Action:** Push changes and Vercel will auto-redeploy

**Result:** Site should work at `https://hair-salon-christelle.vercel.app/`

---

**Just push the changes and wait 2-3 minutes for Vercel to redeploy!** 🚀

