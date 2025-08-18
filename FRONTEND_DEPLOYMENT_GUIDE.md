# 🎨 Frontend Deployment Guide - Italian Real Estate Admin Dashboard

## 📋 **Deployment Status**

✅ **Backend API**: https://domy-backend-git-em-kokojs-projects.vercel.app/api  
✅ **Database**: Supabase PostgreSQL (connected and working)  
✅ **Frontend**: Ready for Netlify deployment

---

## 🚀 **Option 1: Deploy to Netlify (Recommended)**

### **Step 1: Connect to Netlify**

1. **Go to Netlify**: https://netlify.com
2. **Sign up/Login** with your GitHub account
3. **New site from Git** → Connect to GitHub
4. **Select repository**: `kokoj/domy-v-italii---rebuild-em`

### **Step 2: Configure Build Settings**

**Base directory**: `admin-dashboard`  
**Build command**: `npm run build`  
**Publish directory**: `admin-dashboard/dist`

### **Step 3: Environment Variables**

In Netlify Dashboard → Site settings → Environment variables:

```bash
VITE_API_URL=https://domy-backend-git-em-kokojs-projects.vercel.app/api
```

### **Step 4: Deploy & Test**

1. **Deploy the site** - Netlify will auto-deploy
2. **Test the admin dashboard** at your Netlify URL
3. **Login with**: `admin@example.com` / `admin123456`

---

## 🔧 **Option 2: Deploy to Vercel (Alternative)**

### **Step 1: Create New Vercel Project**

1. **Vercel Dashboard** → New Project
2. **Import**: `kokoj/domy-v-italii---rebuild-em`
3. **Root Directory**: `admin-dashboard`
4. **Framework**: React
5. **Build Command**: `npm run build`
6. **Output Directory**: `dist`

### **Step 2: Environment Variables**

```bash
VITE_API_URL=https://domy-backend-git-em-kokojs-projects.vercel.app/api
```

---

## 🎯 **Frontend Features**

Your Italian Real Estate Admin Dashboard includes:

### **🏠 Property Management**

- List all Italian properties from your Supabase database
- Add new properties with images, pricing, location details
- Edit existing properties with full CRUD operations
- Property status management (active/inactive/draft)

### **👥 User Management**

- Manage admin users and permissions
- View user activity and login history
- User role management (admin/editor/viewer)

### **📝 Blog Management**

- Create and edit blog posts about Italian real estate
- SEO-friendly URLs and metadata
- Rich text editor for content creation
- Publish/draft status management

### **📞 Inquiry Management**

- View and respond to property inquiries
- Lead management and tracking
- Contact information and preferences

### **⚙️ Settings & Configuration**

- Site-wide settings and preferences
- API configuration and health monitoring
- System logs and performance metrics

---

## 🔐 **Authentication & Security**

- **JWT-based authentication** with refresh tokens
- **Protected routes** requiring login
- **Role-based access control** for different admin levels
- **Automatic token refresh** to maintain sessions
- **Secure logout** with token cleanup

---

## 🌐 **After Deployment Testing**

### **1. Login Test**

```
https://your-netlify-domain.netlify.app/login
```

- Email: `admin@example.com`
- Password: `admin123456`

### **2. Dashboard Features**

- ✅ Properties page shows real Italian properties
- ✅ Users page shows 4 real users from database
- ✅ Blog management functionality
- ✅ Inquiry management system
- ✅ Settings and configuration

### **3. API Integration**

- ✅ All data loads from Supabase database
- ✅ Real-time updates and CRUD operations
- ✅ Image uploads and file management
- ✅ Search and filtering capabilities

---

## 🎨 **UI/UX Features**

- **Modern Italian Design** with clean, professional styling
- **Responsive Layout** works on desktop, tablet, and mobile
- **Dark/Light Mode** toggle for user preference
- **Toast Notifications** for user feedback
- **Loading States** and error handling
- **Intuitive Navigation** with breadcrumbs and sidebar

---

## 🔧 **Troubleshooting**

### **CORS Issues**

If you get CORS errors, make sure your Netlify domain is added to the backend CORS settings.

### **API Connection Issues**

- Check that `VITE_API_URL` points to the correct backend
- Verify backend is responding at: https://domy-backend-git-em-kokojs-projects.vercel.app/api/health

### **Build Failures**

- Ensure Node.js version compatibility (>=18)
- Check that all dependencies are installed
- Verify TypeScript compilation passes

---

## 🎉 **Your Complete Italian Real Estate Platform**

After deployment, you'll have:

**🏗️ Backend API (Vercel)**

- Real estate property management
- User authentication and authorization
- Blog post management
- Inquiry handling system
- Connected to Supabase PostgreSQL

**🎨 Frontend Dashboard (Netlify)**

- Beautiful Italian real estate admin interface
- Complete property management system
- User and blog management
- Responsive, modern design
- Real-time data from your API

**🗄️ Database (Supabase)**

- PostgreSQL with connection pooling
- Real Italian property data
- User accounts and permissions
- Blog posts and inquiries

---

## 📞 **Support**

Your Italian Real Estate platform is now production-ready! 🇮🇹🏘️

**Login URL**: `https://your-domain.netlify.app/login`  
**Admin Credentials**: `admin@example.com` / `admin123456`  
**API Documentation**: Available at backend `/api/health`

**Congratulations on your complete Italian Real Estate platform! 🎉**
