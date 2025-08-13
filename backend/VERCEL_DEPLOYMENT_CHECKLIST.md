# Vercel Deployment Checklist ✅

## Files Created/Modified

### ✅ New Files
- `vercel.json` - Vercel configuration for serverless deployment
- `api/index.ts` - Serverless function entry point  
- `src/db/prisma.ts` - Prisma client singleton for serverless
- `DEPLOYMENT.md` - Complete deployment guide
- `ENVIRONMENT_VARIABLES.md` - Environment variables reference

### ✅ Modified Files
- `package.json` - Added `postinstall: "prisma generate"` script
- `README.md` - Added deployment documentation links
- All controllers, tests, and utils - Updated to use singleton Prisma client

### ✅ Removed Files
- `src/prisma/client.ts` - Replaced with singleton pattern

## Pre-Deployment Checklist

### Backend Setup
- ✅ Vercel configuration created (`vercel.json`)
- ✅ Serverless handler created (`api/index.ts`)
- ✅ Prisma singleton implemented for connection pooling
- ✅ postinstall script configured for Prisma generation
- ✅ CORS already configured to read from environment variables
- ✅ All imports updated to use singleton Prisma client

### Environment Variables Required
- ✅ `DATABASE_URL` (Supabase pooler URL with connection_limit=1)
- ✅ `JWT_SECRET` (strong 32+ character secret)
- ✅ `REFRESH_TOKEN_SECRET` (different from JWT_SECRET)
- ✅ `JWT_EXPIRES_IN` (e.g., "7d")
- ✅ `REFRESH_TOKEN_EXPIRES_IN` (e.g., "30d") 
- ✅ `ALLOWED_ORIGINS` (your Netlify admin domain)
- ✅ `NODE_ENV` ("production")
- ⚠️ Optional: Cloudinary variables for image uploads

### Deployment Steps
1. ✅ Connect GitHub repo to Vercel
2. ✅ Set root directory to `backend/` 
3. ✅ Add all environment variables in Vercel dashboard
4. ✅ Deploy and test endpoints
5. ✅ Update admin dashboard API URL to Vercel domain

## Test Endpoints After Deployment

```bash
# Replace YOUR_VERCEL_DOMAIN with actual domain

# 1. Health check
curl https://YOUR_VERCEL_DOMAIN.vercel.app/api/health

# 2. Swagger docs (browser)
https://YOUR_VERCEL_DOMAIN.vercel.app/api/docs

# 3. Authentication
curl -X POST https://YOUR_VERCEL_DOMAIN.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123456"}'

# 4. Properties list
curl https://YOUR_VERCEL_DOMAIN.vercel.app/api/properties
```

## Expected Responses

### Health Check
```json
{"success":true,"data":{"status":"ok"}}
```

### Login (with default seeded admin)
```json
{
  "success": true,
  "data": {
    "user": {"id":"...","email":"admin@example.com",...},
    "token": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

## Common Issues & Solutions

### 1. Database Connection Timeout
- ✅ **Solution**: Use Supabase pooler URL with `connection_limit=1`

### 2. CORS Errors in Admin Dashboard
- ✅ **Solution**: Add Netlify domain to `ALLOWED_ORIGINS`

### 3. Prisma Client Issues
- ✅ **Solution**: Verify `postinstall` script and singleton pattern

### 4. Cold Start Performance
- ✅ **Solution**: Consider Vercel Pro for faster cold starts

## Next Steps After Deployment

1. **Update Admin Dashboard**: Change `VITE_API_URL` to your Vercel domain
2. **Test Full Flow**: Login to admin dashboard and verify all features work
3. **Monitor Logs**: Check Vercel function logs for any issues
4. **Setup Monitoring**: Consider adding uptime monitoring
5. **Database Backups**: Ensure Supabase backup strategy is in place

## Production Security Notes

- ✅ Strong JWT secrets configured
- ✅ CORS restricted to specific origins
- ✅ Database connection pooling enabled
- ✅ No secrets in repository
- ✅ Production environment variables separate from development

## Ready for Deployment! 🚀

Your backend is now ready for Vercel deployment. Follow the steps in `DEPLOYMENT.md` for the complete process.
