# Deployment Guide - Italian Real Estate Backend

## Vercel Deployment

### Prerequisites
- GitHub repository with the backend code
- Vercel account
- Supabase PostgreSQL database
- Admin dashboard deployed on Netlify

### Step 1: Connect GitHub Repository to Vercel

1. **Login to Vercel** (https://vercel.com/)
2. **Import Project**:
   - Click "New Project"
   - Import from GitHub
   - Select your repository
   - **Important**: Set the **Root Directory** to `backend/` (not the repository root)
3. **Configure Project**:
   - Framework Preset: "Other" 
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

### Step 2: Environment Variables

Add these environment variables in Vercel Dashboard (Project Settings → Environment Variables):

#### Required Variables

```bash
# Database Connection (Supabase)
DATABASE_URL="postgresql://postgres.xxxxx:password@aws-0-region.pooler.supabase.com:5432/postgres?sslmode=require&pgbouncer=true&connection_limit=1"

# JWT Configuration
JWT_SECRET="your-strong-jwt-secret-here"
REFRESH_TOKEN_SECRET="your-strong-refresh-secret-here"
JWT_EXPIRES_IN="7d"
REFRESH_TOKEN_EXPIRES_IN="30d"

# CORS Configuration
ALLOWED_ORIGINS="https://your-admin-dashboard.netlify.app,http://localhost:5173"

# Environment
NODE_ENV="production"
```

#### Optional Variables (for image upload)

```bash
# Cloudinary (if using image uploads)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"  
CLOUDINARY_API_SECRET="your-api-secret"
```

#### Getting the DATABASE_URL

1. **Go to Supabase Dashboard** → Project → Settings → Database
2. **Use the "Connection Pooling" URL** (not the direct connection URL)
3. **Format should be**: `postgresql://postgres.xxxxx:password@aws-0-region.pooler.supabase.com:5432/postgres?sslmode=require&pgbouncer=true&connection_limit=1`
4. **Important**: Use `connection_limit=1` for serverless functions

### Step 3: Deploy

1. **Manual Deploy**: Click "Deploy" in Vercel dashboard
2. **Automatic Deploy**: Push changes to your GitHub main/master branch

### Step 4: Test Deployment

After deployment, test these endpoints:

#### 1. Health Check
```bash
curl https://your-api-domain.vercel.app/api/health
```
**Expected Response:**
```json
{"success":true,"data":{"status":"ok"}}
```

#### 2. API Documentation
Visit: `https://your-api-domain.vercel.app/api/docs`
- Should show Swagger UI with all endpoints

#### 3. Authentication Test
```bash
curl -X POST https://your-api-domain.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123456"}'
```

#### 4. Database Connection Test
```bash
curl https://your-api-domain.vercel.app/api/properties
```
- Should return a list of properties

### Step 5: Update Admin Dashboard

Update your admin dashboard environment variables on Netlify:

1. **Go to Netlify Dashboard** → Site → Environment variables
2. **Update `VITE_API_URL`**:
   ```
   VITE_API_URL=https://your-api-domain.vercel.app/api
   ```
3. **Redeploy** the admin dashboard

### Step 6: Database Migration (Production)

If you have schema changes, run migrations:

```bash
# Install Vercel CLI locally
npm i -g vercel

# Pull environment variables
vercel env pull .env.production

# Run migration
npx prisma migrate deploy
```

## Troubleshooting

### Common Issues

#### 1. Database Connection Timeout
- **Cause**: Wrong DATABASE_URL or connection pooling issues
- **Solution**: Ensure you're using the Supabase pooler URL with `connection_limit=1`

#### 2. CORS Errors
- **Cause**: Frontend origin not allowed
- **Solution**: Add your Netlify domain to `ALLOWED_ORIGINS`

#### 3. 500 Internal Server Error
- **Cause**: Missing environment variables or database issues
- **Solution**: Check Vercel function logs in dashboard

#### 4. Prisma Client Issues
- **Cause**: Prisma not generated during build
- **Solution**: Verify `postinstall` script runs `prisma generate`

### Checking Logs

1. **Vercel Dashboard** → Functions → View Function Logs
2. **Real-time logs**: `vercel logs --follow`

### Environment-Specific Settings

#### Production Checklist
- [ ] Strong, unique JWT secrets
- [ ] Production database URL with pooling
- [ ] Specific CORS origins (no wildcards)
- [ ] NODE_ENV set to "production"
- [ ] Admin dashboard pointing to production API

## Security Notes

⚠️ **Important Security Considerations**:

1. **Never commit secrets** to repository
2. **Use strong, unique JWT secrets** (minimum 32 characters)
3. **Restrict CORS origins** to known domains only
4. **Use connection pooling** for database to prevent connection exhaustion
5. **Monitor logs** for unauthorized access attempts

## Performance Optimization

1. **Database Connection Pooling**: Already configured with `connection_limit=1`
2. **Prisma Singleton**: Already implemented to prevent multiple client instances
3. **Cold Start Optimization**: Consider upgrading to Vercel Pro for faster cold starts

## Backup Strategy

1. **Database**: Configure Supabase automatic backups
2. **Environment Variables**: Document all required variables
3. **Code**: Use Git tags for production releases
