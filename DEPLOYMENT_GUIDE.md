# 🚀 Complete Deployment Guide - Italian Real Estate Platform

## 📋 **Deployment Architecture Overview**

- **Backend API**: Vercel (serverless functions)
- **Admin Dashboard**: Netlify (static SPA)
- **Database**: Supabase PostgreSQL (connection pooling)

---

## 🔧 **Phase 1: Backend Deployment (Vercel)**

### Prerequisites

- GitHub repository
- Vercel account (https://vercel.com)
- Your Supabase database (already configured)

### Step 1: Deploy Backend to Vercel

1. **Login to Vercel** and click "New Project"
2. **Import from GitHub** - select your repository
3. **CRITICAL**: Set **Root Directory** to `backend/` (not repository root)
4. **Configure Framework**:
   - Framework Preset: "Other"
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

### Step 2: Add Environment Variables in Vercel

Go to Project Settings → Environment Variables and add:

```bash
# Database (use your existing connection)
DATABASE_URL=postgresql://postgres.uvormodvoigugajwoorf:Dn7XbPYTse5R1nxx@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true&connection_limit=1

# JWT (CHANGE THESE TO STRONG SECRETS)
JWT_SECRET=your_strong_jwt_secret_32chars_minimum_change_this
REFRESH_TOKEN_SECRET=your_strong_refresh_secret_32chars_minimum_change_this
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_EXPIRES_IN=30d

# CORS (update with your Netlify domain after frontend deployment)
ALLOWED_ORIGINS=https://your-admin-dashboard.netlify.app

# Environment
NODE_ENV=production

# Admin seed
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123456
ADMIN_NAME=Admin

# Security (Rate Limiting)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Step 3: Test Backend Deployment

After deployment, test these endpoints:

```bash
# Replace YOUR_VERCEL_DOMAIN with actual domain
curl https://YOUR_VERCEL_DOMAIN.vercel.app/api/health
curl https://YOUR_VERCEL_DOMAIN.vercel.app/api/properties
```

Visit Swagger docs: `https://YOUR_VERCEL_DOMAIN.vercel.app/api/docs`

---

## 🎨 **Phase 2: Frontend Deployment (Netlify)**

### Step 1: Deploy Admin Dashboard to Netlify

1. **Login to Netlify** (https://netlify.com)
2. **New site from Git** → Connect to GitHub → Select repository
3. **Configure Build Settings**:
   - Base directory: `admin-dashboard/`
   - Build command: `npm run build`
   - Publish directory: `admin-dashboard/dist`

### Step 2: Environment Variables in Netlify

Go to Site settings → Environment variables:

```bash
# Replace with your actual Vercel backend domain
VITE_API_URL=https://YOUR_VERCEL_DOMAIN.vercel.app/api
```

### Step 3: Update Backend CORS

After getting your Netlify domain, update Vercel environment variables:

```bash
# Update this in Vercel with your actual Netlify domain
ALLOWED_ORIGINS=https://your-actual-domain.netlify.app
```

### Step 4: Redeploy Both Services

1. **Redeploy Vercel** (after CORS update)
2. **Redeploy Netlify** (after VITE_API_URL update)

---

## 🧪 **Phase 3: Testing Deployment**

### Test Complete Flow

1. **Access admin dashboard**: `https://your-domain.netlify.app`
2. **Login with**:
   - Email: `admin@example.com`
   - Password: `admin123456`
3. **Verify all features work**:
   - Dashboard loading
   - Properties list
   - User management
   - Blog posts
   - Settings

---

## 🔧 **Troubleshooting Common Issues**

### CORS Errors

- **Symptom**: API calls failing from frontend
- **Solution**: Ensure Netlify domain is in Vercel's `ALLOWED_ORIGINS`

### 404 Errors on Netlify

- **Symptom**: Direct URL access fails
- **Solution**: Add `_redirects` file (already configured in vercel.json)

### Database Connection Issues

- **Symptom**: 500 errors from API
- **Solution**: Verify DATABASE_URL is correct with pooling parameters

### Slow Cold Starts

- **Symptom**: First API calls are slow
- **Solution**: Consider Vercel Pro for faster cold starts

---

## 📝 **Security Checklist**

- [ ] Strong JWT secrets (32+ characters)
- [ ] Production DATABASE_URL with connection pooling
- [ ] Specific CORS origins (no wildcards)
- [ ] NODE_ENV set to "production"
- [ ] No secrets committed to repository

---

## 🔄 **Future Updates**

### Code Changes

1. Push to GitHub main/master branch
2. Vercel and Netlify auto-deploy

### Database Schema Changes

```bash
# Use direct connection for schema updates
DATABASE_URL="postgresql://postgres.uvormodvoigugajwoorf:Dn7XbPYTse5R1nxx@aws-0-eu-central-1.pooler.supabase.com:5432/postgres?sslmode=require"
npx prisma db push
# Switch back to pooler URL for production
```

---

## 📞 **Support**

If you encounter issues:

1. Check Vercel function logs
2. Check Netlify build logs
3. Verify environment variables
4. Test API endpoints individually

**Your application is now ready for production! 🎉**
