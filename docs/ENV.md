# Environment Variables Guide

## Required Environment Variables

### Database
- `DATABASE_URL` - PostgreSQL connection string
  - Dev: `postgresql://postgres:postgres@localhost:5432/realestate?schema=public`
  - Production: Use your hosted PostgreSQL URL

### JWT Authentication
- `JWT_SECRET` - Secret for signing access tokens (change in production!)
- `REFRESH_TOKEN_SECRET` - Secret for signing refresh tokens (change in production!)
- `JWT_EXPIRES_IN` - Access token expiry (default: `7d`)
- `REFRESH_TOKEN_EXPIRES_IN` - Refresh token expiry (default: `30d`)

### CORS Configuration
- `ALLOWED_ORIGINS` - Comma-separated list of allowed origins
  - Dev: `http://localhost:5173,http://127.0.0.1:5173`
  - Production: Add `https://your-admin.netlify.app`
  - Example: `http://localhost:5173,https://your-admin.netlify.app`

### Cloudinary (Image Upload)
- `CLOUDINARY_CLOUD_NAME` - Your Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Your Cloudinary API key  
- `CLOUDINARY_API_SECRET` - Your Cloudinary API secret

### Admin Seed User
- `ADMIN_EMAIL` - Email for seeded admin user (default: `admin@example.com`)
- `ADMIN_PASSWORD` - Password for seeded admin user (default: `admin123456`)
- `ADMIN_NAME` - Name for seeded admin user (default: `Admin`)

### Security & Rate Limiting
- `RATE_LIMIT_WINDOW_MS` - Rate limit window in ms (default: `900000` = 15 min)
- `RATE_LIMIT_MAX_REQUESTS` - Max requests per window (default: `100`)

### Server Configuration
- `PORT` - Server port (default: `3001`)
- `NODE_ENV` - Environment mode (`development`, `production`)

## Setup Instructions

1. Copy `env copy.example` to `.env`
2. Update `DATABASE_URL` with your database connection
3. Change JWT secrets in production
4. Configure Cloudinary credentials for image uploads
5. Set appropriate `ALLOWED_ORIGINS` for your deployment

## Safe Development Defaults

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/realestate?schema=public"
JWT_SECRET="dev_jwt_secret_change_me"
REFRESH_TOKEN_SECRET="dev_refresh_secret_change_me"
JWT_EXPIRES_IN="7d"
REFRESH_TOKEN_EXPIRES_IN="30d"
ALLOWED_ORIGINS="http://localhost:5173,http://127.0.0.1:5173"
RATE_LIMIT_WINDOW_MS="900000"
RATE_LIMIT_MAX_REQUESTS="100"
PORT="3001"
NODE_ENV="development"
```

## Production Security Notes

- ⚠️ **Always change JWT secrets in production**
- ⚠️ **Use strong, unique passwords for admin user**
- ⚠️ **Set specific ALLOWED_ORIGINS (no wildcards)**
- ⚠️ **Use HTTPS URLs in production CORS settings**
