# Hair Salon - Multi-Tenant Booking System

A modern, multi-tenant hair salon booking application built with Angular and Supabase.

## 🚀 Quick Start

See [`hair-salon-app/QUICK_START.md`](hair-salon-app/QUICK_START.md) for detailed setup instructions.

### Local Development

```bash
cd hair-salon-app
npm install
npm start
```

Open [http://localhost:4200](http://localhost:4200)

### Database Setup

1. Open Supabase Dashboard → SQL Editor
2. Run `hair-salon-app/supabase/FRESH_DATABASE_SETUP.sql`
3. Done!

## 📁 Project Structure

```
hairAtChristelle/
├── hair-salon-app/          # Angular application
│   ├── src/                 # Source code
│   ├── supabase/            # Database scripts
│   ├── QUICK_START.md       # Setup guide
│   └── package.json
├── vercel.json              # Vercel deployment config
└── README.md                # This file
```

## 🌐 Deployment

Deployed on Vercel: [https://hair-salon-christelle.vercel.app](https://hair-salon-christelle.vercel.app)

## 📖 Documentation

- [Quick Start Guide](hair-salon-app/QUICK_START.md)
- [Database Setup](hair-salon-app/supabase/README.md)
- [Multi-Tenant Guide](hair-salon-app/MULTI_TENANT_GUIDE.md)
- [Deployment Guide](hair-salon-app/DEPLOYMENT.md)

## ✨ Features

- Multi-tenant architecture
- Tenant-specific services
- Image upload for tenant logos
- Dynamic hero backgrounds
- Service management
- Responsive design

## 🛠️ Tech Stack

- **Frontend:** Angular 20
- **Backend:** Supabase (PostgreSQL)
- **Storage:** Supabase Storage
- **Deployment:** Vercel
- **Language:** TypeScript

## 📝 License

Private project for Christelle's Hair Salon

