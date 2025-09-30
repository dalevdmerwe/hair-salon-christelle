# 🚀 Deployment Guide

## Platform Comparison

| Platform | Best For | Free Tier | Custom Domain | Auto Deploy | Setup |
|----------|----------|-----------|---------------|-------------|-------|
| **Vercel** | Angular + Supabase | ✅ Yes | ✅ Free | ✅ Yes | ⭐⭐⭐ Easy |
| **Netlify** | Static Sites | ✅ Yes | ✅ Free | ✅ Yes | ⭐⭐⭐ Easy |
| **Firebase** | Firebase Stack | ✅ Yes | ✅ Free | ❌ Manual | ⭐⭐ Medium |

## 🎯 Recommended: Vercel

### Why Vercel?
- ✅ Zero configuration for Angular
- ✅ Perfect for Supabase integration
- ✅ Free custom domains (hair.cristelle.myshop.web.za)
- ✅ Automatic HTTPS
- ✅ GitHub auto-deploy
- ✅ Environment variables support
- ✅ Edge network (fast globally)

---

## 📋 Option 1: Deploy to Vercel (Recommended)

### Step 1: Prepare Your Code

1. **Make sure everything is committed:**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Test production build locally:**
   ```bash
   cd hair-salon-app
   npm run build
   ```

### Step 2: Deploy to Vercel

#### Method A: Using Vercel Website (Easiest)

1. **Go to** [vercel.com](https://vercel.com)
2. **Sign up** with GitHub
3. **Click "Add New Project"**
4. **Import your GitHub repository**
5. **Configure:**
   - Framework Preset: Angular
   - Root Directory: `hair-salon-app`
   - Build Command: `npm run build`
   - Output Directory: `dist/hair-salon-app/browser`
6. **Add Environment Variables:**
   - Click "Environment Variables"
   - Add your Supabase credentials (see below)
7. **Click "Deploy"**

#### Method B: Using Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
cd hair-salon-app
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? hair-salon-christelle
# - Directory? ./
# - Override settings? No
```

### Step 3: Configure Custom Domain

1. **In Vercel Dashboard:**
   - Go to your project
   - Click "Settings" → "Domains"
   - Add: `hair.cristelle.myshop.web.za`

2. **In your DNS provider (myshop.web.za):**
   - Add CNAME record:
     - Name: `hair.cristelle`
     - Value: `cname.vercel-dns.com`
   - Or A record:
     - Name: `hair.cristelle`
     - Value: `76.76.21.21`

3. **Wait for DNS propagation** (5-30 minutes)

### Step 4: Environment Variables

Add these in Vercel Dashboard → Settings → Environment Variables:

```
SUPABASE_URL=https://ukcxattnpsvviqsbfaem.supabase.co
SUPABASE_KEY=your-anon-key-here
```

**Important:** Don't commit these to GitHub!

---

## 📋 Option 2: Deploy to Netlify

### Step 1: Prepare

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Step 2: Deploy

1. **Go to** [netlify.com](https://netlify.com)
2. **Sign up** with GitHub
3. **Click "Add new site" → "Import an existing project"**
4. **Connect to GitHub** and select your repo
5. **Configure:**
   - Base directory: `hair-salon-app`
   - Build command: `npm run build`
   - Publish directory: `dist/hair-salon-app/browser`
6. **Add Environment Variables** (same as Vercel)
7. **Click "Deploy"**

### Step 3: Custom Domain

1. **In Netlify Dashboard:**
   - Go to "Domain settings"
   - Click "Add custom domain"
   - Enter: `hair.cristelle.myshop.web.za`

2. **Update DNS** (same as Vercel)

---

## 📋 Option 3: Deploy to Firebase Hosting

### Step 1: Install Firebase CLI

```bash
npm install -g firebase-tools
```

### Step 2: Login and Initialize

```bash
# Login
firebase login

# Initialize (in hair-salon-app directory)
cd hair-salon-app
firebase init hosting

# Select:
# - Use existing project or create new
# - Public directory: dist/hair-salon-app/browser
# - Single-page app: Yes
# - GitHub auto-deploy: Optional
```

### Step 3: Build and Deploy

```bash
# Build production
npm run build

# Deploy
firebase deploy --only hosting
```

### Step 4: Custom Domain

1. **In Firebase Console:**
   - Go to Hosting
   - Click "Add custom domain"
   - Enter: `hair.cristelle.myshop.web.za`
   - Follow DNS instructions

---

## 🔐 Environment Variables

### For Production

Create `src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  supabaseUrl: 'https://ukcxattnpsvviqsbfaem.supabase.co',
  supabaseKey: 'your-anon-key-here',
  appUrl: 'https://hair.cristelle.myshop.web.za'
};
```

### Security Best Practices

1. **Never commit API keys** to GitHub
2. **Use environment variables** in deployment platform
3. **Use Supabase RLS** to secure data
4. **Add authentication** before production

---

## 📊 Post-Deployment Checklist

### 1. Test the Deployment

- [ ] Site loads correctly
- [ ] All routes work (/, /admin/tenants, /admin/{id}/services)
- [ ] Images load
- [ ] Supabase connection works
- [ ] Can create/edit/delete tenants
- [ ] Can create/edit/delete services

### 2. Configure Supabase

- [ ] Add production URL to Supabase allowed origins
- [ ] Update RLS policies for production
- [ ] Set up Supabase storage bucket for images

### 3. DNS Configuration

- [ ] Custom domain points to deployment
- [ ] HTTPS is enabled
- [ ] www redirect (if needed)

### 4. Performance

- [ ] Test page load speed
- [ ] Check mobile responsiveness
- [ ] Verify images are optimized

---

## 🔧 Supabase Configuration for Production

### 1. Add Production URL

1. **Go to Supabase Dashboard**
2. **Settings** → **API**
3. **Add URL to allowed origins:**
   ```
   https://hair.cristelle.myshop.web.za
   ```

### 2. Create Storage Bucket

```sql
-- Run in Supabase SQL Editor
INSERT INTO storage.buckets (id, name, public)
VALUES ('tenant-images', 'tenant-images', true);

-- Set up storage policy
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'tenant-images');

CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'tenant-images');
```

---

## 🐛 Troubleshooting

### Build Fails

**Error:** `Module not found`
- Run `npm install` locally
- Check all imports are correct
- Verify `package.json` is complete

**Error:** `Out of memory`
- Increase Node memory: `NODE_OPTIONS=--max_old_space_size=4096`

### Routes Don't Work (404)

- Check `vercel.json` or `netlify.toml` has rewrites
- Verify SPA configuration

### Supabase Connection Fails

- Check environment variables are set
- Verify Supabase URL is in allowed origins
- Check browser console for CORS errors

### Images Don't Upload

- Verify storage bucket exists
- Check RLS policies on storage
- Ensure bucket is public

---

## 💰 Cost Comparison

### Vercel Free Tier
- ✅ 100GB bandwidth/month
- ✅ Unlimited sites
- ✅ Custom domains
- ✅ Automatic HTTPS
- **Cost:** $0/month

### Netlify Free Tier
- ✅ 100GB bandwidth/month
- ✅ Unlimited sites
- ✅ Custom domains
- **Cost:** $0/month

### Firebase Free Tier
- ✅ 10GB storage
- ✅ 360MB/day bandwidth
- ✅ Custom domains
- **Cost:** $0/month (limited)

---

## 🎯 My Recommendation

**Use Vercel** because:
1. Best Angular support
2. Perfect Supabase integration
3. Easiest setup
4. Best free tier
5. Automatic deployments

**Steps:**
1. Push code to GitHub
2. Connect to Vercel
3. Add environment variables
4. Configure custom domain
5. Done! 🎉

---

## 📞 Need Help?

Common issues:
- **Build fails:** Check Node version (use v20)
- **Routes 404:** Check SPA configuration
- **Supabase errors:** Verify environment variables
- **Domain issues:** Wait for DNS propagation (up to 48h)

---

## 🚀 Quick Start (Vercel)

```bash
# 1. Commit and push
git add .
git commit -m "Ready for deployment"
git push origin main

# 2. Go to vercel.com
# 3. Import GitHub repo
# 4. Deploy!
```

That's it! Your site will be live in minutes. 🎉

