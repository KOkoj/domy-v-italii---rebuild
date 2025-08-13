# Italian Real Estate Admin Dashboard

A production-ready admin dashboard for managing Italian real estate properties, built with React, TypeScript, and modern web technologies.

## 🚀 Features

- **Authentication**: JWT-based authentication with refresh token support
- **Property Management**: Create, read, update, delete property listings
- **Blog Management**: Manage blog posts with markdown support
- **Inquiry Management**: Handle customer inquiries and lead management
- **User Management**: Manage system users and permissions
- **Settings**: Configure application settings
- **File Upload**: Image upload with drag & drop support
- **Responsive Design**: Mobile-first responsive UI
- **Real-time Status**: Environment widget with API health monitoring
- **Testing**: Unit tests (Vitest) and E2E tests (Playwright)

## 🛠 Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **Routing**: React Router v6
- **State Management**: TanStack Query (React Query)
- **HTTP Client**: Axios with interceptors
- **UI Components**: Custom Tailwind-based components
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Testing**: Vitest + React Testing Library + Playwright
- **Deployment**: Netlify

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- Running backend API at `http://localhost:3001/api` (default)

## 🚀 Quick Start

### 1. Installation

```bash
cd admin-dashboard
cp env.example .env
npm install
```

### 2. Environment Configuration

Edit `.env` file:

```env
VITE_API_URL=http://localhost:3001/api
VITE_APP_NAME=Italian Real Estate Admin
VITE_APP_VERSION=0.1.0
```

### 3. Development

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### 4. Default Login Credentials

For development/testing:

- **Email**: admin@example.com
- **Password**: admin123456

## 📁 Project Structure

```
admin-dashboard/
├── src/
│   ├── components/          # Reusable components
│   │   ├── ui/             # Base UI components
│   │   ├── Layout.tsx      # App layout
│   │   ├── Navbar.tsx      # Top navigation
│   │   ├── Sidebar.tsx     # Side navigation
│   │   └── EnvWidget.tsx   # Environment status
│   ├── context/            # React contexts
│   │   └── AuthContext.tsx # Authentication state
│   ├── lib/                # Utilities
│   │   └── api.ts          # Axios configuration
│   ├── pages/              # Route components
│   │   ├── properties/     # Property management
│   │   ├── blog/           # Blog management
│   │   ├── inquiries/      # Inquiry management
│   │   ├── users/          # User management
│   │   ├── DashboardPage.tsx
│   │   ├── LoginPage.tsx
│   │   └── SettingsPage.tsx
│   └── test/               # Test setup
├── tests/e2e/              # Playwright E2E tests
├── public/                 # Static assets
└── dist/                   # Build output
```

## 🧪 Testing

### Unit Tests

```bash
# Run unit tests
npm run test

# Run tests in watch mode
npm run test:ui
```

### E2E Tests

```bash
# Run E2E tests
npm run e2e

# Run E2E tests with UI
npm run e2e:ui
```

**Note**: E2E tests require the backend API to be running at `http://localhost:3001/api`

## 🔧 Development Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run unit tests
- `npm run test:ui` - Run tests in watch mode
- `npm run e2e` - Run E2E tests
- `npm run e2e:ui` - Run E2E tests with UI
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## 🌐 Deployment

### Netlify Deployment

1. **Connect Repository**: Link your Git repository to Netlify

2. **Build Settings**:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Base directory: `admin-dashboard`

3. **Environment Variables**:

   ```
   VITE_API_URL=https://your-api-domain.com/api
   VITE_APP_NAME=Italian Real Estate Admin
   VITE_APP_VERSION=1.0.0
   ```

4. **Deploy**: Push to main branch to trigger deployment

### Manual Build

```bash
npm run build
# Upload dist/ folder to your hosting provider
```

## 🔑 Authentication Flow

1. **Login**: POST `/auth/login` with email/password
2. **Token Storage**: Stores `token` and `refreshToken` in localStorage
3. **Auto-attach**: Axios interceptor adds `Authorization: Bearer <token>` to requests
4. **Auto-refresh**: On 401 response, automatically calls `/auth/refresh`
5. **Logout**: Clears localStorage and redirects to login

## 🎨 UI Components

### Base Components

- `Button` - Various styles and loading states
- `Input` - Form input with label, error, and hint support
- `Select` - Dropdown select component
- `Textarea` - Multi-line text input
- `Modal` - Modal dialog with backdrop
- `ConfirmDialog` - Confirmation modal
- `DataTable` - Data table with pagination and sorting
- `FileUploader` - File upload with drag & drop

### Layout Components

- `Layout` - Main app layout wrapper
- `Navbar` - Top navigation bar
- `Sidebar` - Side navigation menu
- `RequireAuth` - Protected route wrapper

## 📊 API Integration

The app integrates with the backend API for:

- **Properties**: CRUD operations for property listings
- **Blog**: Blog post management
- **Inquiries**: Customer inquiry handling
- **Users**: User management
- **Settings**: Application configuration
- **Upload**: File upload to cloud storage
- **Auth**: Authentication and authorization

## 🧭 Navigation Structure

```
/login (public)
/dashboard (protected)
/properties (protected)
  ├── /new
  └── /:id
/blog (protected)
  ├── /new
  └── /:id
/inquiries (protected)
  └── /:id
/users (protected)
  └── /:id
/settings (protected)
```

## 🛡 Security Features

- JWT token-based authentication
- Automatic token refresh
- Protected routes
- Request/response interceptors
- XSS protection via React
- Environment variable configuration

## 🎯 Performance Features

- Code splitting with React.lazy
- Image optimization
- React Query caching
- Optimistic updates
- Error boundaries
- Loading states

## 🐛 Troubleshooting

### Common Issues

1. **API Connection Failed**
   - Check `VITE_API_URL` in `.env`
   - Ensure backend is running
   - Check CORS configuration

2. **Authentication Issues**
   - Clear localStorage: `localStorage.clear()`
   - Check backend auth endpoints
   - Verify JWT secrets match

3. **Build Issues**
   - Clear node_modules and reinstall
   - Check Node.js version (18+)
   - Verify all environment variables

### Environment Widget

The environment widget in the top-right shows:

- Current API URL
- API server status
- Health check status
- Last status check time

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a pull request

## 📞 Support

For support and questions:

- Check the troubleshooting section above
- Review the API documentation
- Check browser console for errors
- Verify backend connectivity
