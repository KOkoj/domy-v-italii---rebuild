# Environment Variables for Vercel Production

## Required Environment Variables

Copy these to your Vercel project's environment variables section:

### Database
```
DATABASE_URL=postgresql://postgres.xxxxx:password@aws-0-region.pooler.supabase.com:5432/postgres?sslmode=require&pgbouncer=true&connection_limit=1
```
**Note**: Use Supabase POOLER URL (not direct connection) with `connection_limit=1` for serverless

### JWT Authentication
```
JWT_SECRET=your-strong-32-character-secret-here
REFRESH_TOKEN_SECRET=your-strong-32-character-refresh-secret-here
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_EXPIRES_IN=30d
```

### CORS Configuration
```
ALLOWED_ORIGINS=https://your-admin-dashboard.netlify.app,http://localhost:5173
```
**Note**: Replace `your-admin-dashboard.netlify.app` with your actual Netlify domain

### Runtime Environment
```
NODE_ENV=production
```

## Optional Environment Variables

### Cloudinary (for image uploads)
```
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Rate Limiting (optional - has defaults)
```
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Admin Seed User (for seeding only)
```
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123456
ADMIN_NAME=Admin
```

## Environment Variable Setup Guide

### 1. Supabase Database URL
1. Go to Supabase Dashboard → Project → Settings → Database
2. Find "Connection Pooling" section
3. Copy the pooled connection string
4. Ensure it includes `?sslmode=require&pgbouncer=true&connection_limit=1`

### 2. Generate JWT Secrets
```bash
# Generate strong secrets (Node.js)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Admin Dashboard Domain
- Get your Netlify domain from Netlify Dashboard
- Add both production and localhost for development
- Format: `https://your-app.netlify.app,http://localhost:5173`

## Security Checklist

- [ ] JWT_SECRET is at least 32 characters and cryptographically random
- [ ] REFRESH_TOKEN_SECRET is different from JWT_SECRET
- [ ] DATABASE_URL uses connection pooling with limit=1
- [ ] ALLOWED_ORIGINS contains only trusted domains
- [ ] NODE_ENV is set to "production"
- [ ] No secrets are committed to repository
- [ ] Cloudinary secrets are kept private if using image uploads

## Testing Environment Variables

After setting up, verify with these tests:

```bash
# Test health endpoint
curl https://your-api.vercel.app/api/health

# Test CORS (replace with your admin domain)
curl -H "Origin: https://your-admin.netlify.app" https://your-api.vercel.app/api/health

# Test authentication
curl -X POST https://your-api.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123456"}'
```
