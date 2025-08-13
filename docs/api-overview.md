# API Overview

## Base URL
- Development: `http://localhost:3001/api`
- Production: `https://your-backend-domain.com/api`

## Authentication
The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Response Format
All API responses follow a consistent format:

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description",
  "error": { ... } // Optional error details
}
```

## Endpoints Overview

### 🔐 Authentication
- `POST /auth/login` - Login with email/password
- `POST /auth/refresh` - Refresh access token
- `GET /auth/me` - Get current user info (requires auth)
- `POST /auth/logout` - Logout (requires auth)

### 🏠 Properties
- `GET /properties` - List properties (public, supports pagination and filters)
- `GET /properties/:id` - Get property by ID (public)
- `POST /properties` - Create property (ADMIN/MANAGER only)
- `PUT /properties/:id` - Update property (ADMIN/MANAGER only)
- `DELETE /properties/:id` - Delete property (ADMIN/MANAGER only)

### 📝 Blog
- `GET /blog` - List blog posts (public)
- `GET /blog/:id` - Get blog post by ID (public)
- `POST /blog` - Create blog post (ADMIN/MANAGER only)
- `PUT /blog/:id` - Update blog post (ADMIN/MANAGER only)
- `DELETE /blog/:id` - Delete blog post (ADMIN/MANAGER only)

### 💬 Inquiries
- `POST /inquiries` - Create inquiry (public)
- `GET /inquiries` - List inquiries (authenticated users only)
- `GET /inquiries/:id` - Get inquiry by ID (authenticated users only)
- `PUT /inquiries/:id` - Update inquiry status (ADMIN/MANAGER/EMPLOYEE)

### 👥 Users
- `GET /users` - List users (MANAGER+)
- `GET /users/:id` - Get user by ID (MANAGER+)
- `POST /users` - Create user (ADMIN only)
- `PUT /users/:id` - Update user (ADMIN only)
- `DELETE /users/:id` - Delete user (ADMIN only)

### ⚙️ Settings
- `GET /settings` - Get all settings (ADMIN only)
- `PUT /settings` - Update settings (ADMIN only)

### 📊 Dashboard
- `GET /dashboard` - Get combined stats and activity (authenticated)
- `GET /dashboard/stats` - Get dashboard statistics (authenticated)
- `GET /dashboard/activity` - Get recent activity (authenticated)

### 📁 Upload
- `POST /upload` - Upload images (authenticated, max 10MB, jpg/png/webp only)

### 🏥 Health
- `GET /health` - Health check (public)

## Role-Based Permissions

### ADMIN
- Full access to all endpoints
- Can manage users, properties, blog posts, inquiries, and settings

### MANAGER
- Can manage properties and blog posts
- Can view and update inquiries
- Can view users (read-only)

### EMPLOYEE
- Can view and update inquiries
- Read-only access to other resources

## Pagination
List endpoints support pagination with query parameters:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)
- `search` - Search term
- Additional filters vary by endpoint

Example:
```
GET /properties?page=2&limit=20&type=apartment&status=ACTIVE&search=Florence
```

## Error Codes
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting
- 100 requests per 15-minute window per IP
- Configurable via environment variables

## File Upload
- Maximum file size: 10MB
- Allowed formats: JPEG, PNG, WebP
- Maximum 10 files per request
- Returns array of uploaded URLs

## Example Requests

### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "admin123456"}'
```

### Create Property
```bash
curl -X POST http://localhost:3001/api/properties \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Beautiful Villa",
    "description": "Stunning property in Tuscany",
    "priceEuro": 500000,
    "type": "villa",
    "address": "Via Roma 123",
    "city": "Florence",
    "region": "Tuscany",
    "postalCode": "50100",
    "bedrooms": 4,
    "bathrooms": 3,
    "area": 250
  }'
```

### List Properties with Filters
```bash
curl "http://localhost:3001/api/properties?page=1&limit=10&type=apartment&city=Florence&search=luxury"
```

## Documentation
- Full API documentation available at `/api/docs` (Swagger UI)
- Interactive testing available through Swagger interface

## Development
- Run `npm run dev` to start development server
- Run `npm run test` to execute test suite
- Run `npm run db:seed` to populate with sample data