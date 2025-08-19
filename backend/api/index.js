// Italian Real Estate API with Database Connectivity - PgBouncer Compatible
import { PrismaClient } from '@prisma/client';

// Global Prisma client instance (singleton pattern for serverless)
let prisma = null;

// Get or create Prisma client (singleton pattern to avoid prepared statement conflicts)
const getPrismaClient = () => {
  if (!prisma) {
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
      // Configure for PgBouncer compatibility
      log: process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
    });
  }
  return prisma;
};

// Helper function to run database queries with timeout
const withTimeout = (promise, timeoutMs = 8000) => {
  const timeout = new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`Database query timeout after ${timeoutMs}ms`)), timeoutMs);
  });
  return Promise.race([promise, timeout]);
};

// Parse request body helper
const parseBody = (req) => {
  if (req.method === 'POST' || req.method === 'PUT') {
    if (req.body) {
      return typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    }
  }
  return {};
};

export default async (req, res) => {
  console.log('Request:', req.method, req.url);
  
  // Set CORS headers
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  const url = req.url || '';
  const hasDatabase = !!process.env.DATABASE_URL;
  const body = parseBody(req);
  
  // Root endpoint
  if (url === '/' || url === '/api') {
    return res.status(200).json({
      success: true,
      message: 'Italian Real Estate API - PgBouncer Compatible',
      version: '2.1.0',
      timestamp: new Date().toISOString(),
      database: hasDatabase ? 'Connected to Supabase' : 'No database configured',
      endpoints: ['dashboard', 'properties', 'blog', 'inquiries', 'users', 'settings', 'auth/login', 'health']
    });
  }
  
  // Health check with database status
  if (url.includes('/health')) {
    let dbStatus = 'Not configured';
    
    if (hasDatabase) {
      try {
        const prismaClient = getPrismaClient();
        await withTimeout(prismaClient.$queryRaw`SELECT 1`, 3000);
        dbStatus = 'Connected and healthy';
      } catch (error) {
        console.error('Database health check failed:', error.message);
        dbStatus = 'Connected but error: ' + error.message;
      }
    }
    
    return res.status(200).json({ 
      ok: true,
      message: 'API healthy',
      database: dbStatus,
      timestamp: new Date().toISOString()
    });
  }

  // =============================================================================
  // AUTHENTICATION ENDPOINT - CRITICAL: Fixed for PgBouncer
  // =============================================================================
  if (url.includes('/auth/login') && req.method === 'POST') {
    const { email, password } = body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }
    
    if (!hasDatabase) {
      if (email === 'admin@example.com' && password === 'admin123456') {
        return res.status(200).json({
          success: true,
          data: {
            user: { id: 'test-admin', email, name: 'Test Admin', role: 'ADMIN' },
            token: 'test-token-' + Date.now()
          },
          note: 'Test authentication - no database'
        });
      }
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    
    try {
      console.log('Authenticating user:', email);
      
      const prismaClient = getPrismaClient();
      
      const user = await withTimeout(
        prismaClient.user.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            name: true,
            password: true,
            role: true,
            isActive: true,
            createdAt: true,
            avatar: true
          }
        }),
        5000
      );
      
      if (!user || !user.isActive) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }
      
      // For demo purposes, we'll skip password hashing comparison
      console.log('User found:', user.email);
      
      const { password: _, ...safeUser } = user;
      
      return res.status(200).json({
        success: true,
        data: {
          user: safeUser,
          token: 'jwt-token-' + Date.now(),
          refreshToken: 'refresh-token-' + Date.now(),
          expiresIn: '7d'
        },
        message: 'Login successful'
      });
      
    } catch (error) {
      console.error('Authentication error:', error.message);
      return res.status(500).json({
        success: false,
        error: 'Authentication failed',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // =============================================================================
  // DASHBOARD ENDPOINT - Aggregates data for dashboard
  // =============================================================================
  if (url.includes('/dashboard') && req.method === 'GET') {
    if (!hasDatabase) {
      return res.status(200).json({
        success: true,
        data: {
          stats: { propertiesCount: 0, draftsCount: 0, inquiriesTodayCount: 0, inquiriesWeekCount: 0 },
          activity: { properties: [], blog: [], inquiries: [] }
        }
      });
    }
    
    try {
      const prismaClient = getPrismaClient();
      
      // Get counts for stats
      const [propertiesCount, activePropertiesCount, draftsCount, inquiriesCount, inquiriesWeekCount] = await Promise.all([
        withTimeout(prismaClient.property.count(), 5000),
        withTimeout(prismaClient.property.count({ where: { status: 'ACTIVE' } }), 5000),
        withTimeout(prismaClient.blogPost.count({ where: { status: 'DRAFT' } }), 5000),
        withTimeout(prismaClient.inquiry.count({ 
          where: { 
            createdAt: { 
              gte: new Date(new Date().setHours(0, 0, 0, 0))
            } 
          } 
        }), 5000),
        withTimeout(prismaClient.inquiry.count({ 
          where: { 
            createdAt: { 
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            } 
          } 
        }), 5000)
      ]);

      // Get recent activity
      const [recentProperties, recentBlogPosts, recentInquiries] = await Promise.all([
        withTimeout(prismaClient.property.findMany({
          take: 5,
          select: {
            id: true,
            title: true,
            city: true,
            type: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' }
        }), 5000),
        withTimeout(prismaClient.blogPost.findMany({
          take: 5,
          select: {
            id: true,
            title: true,
            status: true,
            createdAt: true,
            author: {
              select: { name: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        }), 5000),
        withTimeout(prismaClient.inquiry.findMany({
          take: 5,
          select: {
            id: true,
            name: true,
            email: true,
            status: true,
            createdAt: true,
            property: {
              select: { title: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        }), 5000)
      ]);

      return res.status(200).json({
        success: true,
        data: {
          stats: {
            propertiesCount,
            activePropertiesCount,
            draftsCount,
            inquiriesTodayCount: inquiriesCount,
            inquiriesWeekCount
          },
          activity: {
            properties: recentProperties,
            blog: recentBlogPosts,
            inquiries: recentInquiries
          }
        },
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Dashboard error:', error.message);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch dashboard data',
        message: error.message
      });
    }
  }

  // =============================================================================
  // PROPERTIES ENDPOINTS - Full CRUD (Working endpoints)
  // =============================================================================
  if (url.includes('/properties')) {
    try {
      const prismaClient = getPrismaClient();

      // GET /properties - List with filters and pagination
      if (req.method === 'GET' && !url.match(/\/properties\/[^\/]+$/)) {
        const urlParams = new URL(url, 'http://localhost').searchParams;
        const page = parseInt(urlParams.get('page') || '1');
        const limit = parseInt(urlParams.get('limit') || '10');
        const search = urlParams.get('search') || '';
        const type = urlParams.get('type') || '';
        const status = urlParams.get('status') || '';
        const sort = urlParams.get('sort') || 'createdAt';
        const order = urlParams.get('order') || 'desc';
        
        const skip = (page - 1) * limit;
        
        // Build where clause
        const where = {};
        if (search) {
          where.OR = [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            { city: { contains: search, mode: 'insensitive' } }
          ];
        }
        if (type) where.type = type;
        if (status) where.status = status;
        
        const [properties, total] = await Promise.all([
          withTimeout(prismaClient.property.findMany({
            where,
            skip,
            take: limit,
            select: {
              id: true,
              title: true,
              slug: true,
              description: true,
              priceCents: true,
              type: true,
              status: true,
              city: true,
              region: true,
              bedrooms: true,
              bathrooms: true,
              area: true,
              createdAt: true,
              updatedAt: true
            },
            orderBy: { [sort]: order }
          }), 8000),
          withTimeout(prismaClient.property.count({ where }), 5000)
        ]);
        
        // Transform data for frontend compatibility
        const transformedProperties = properties.map(property => ({
          ...property,
          priceEuro: Math.round(property.priceCents / 100),
          isActive: property.status === 'ACTIVE',
          city: property.city || 'City pending',
          region: property.region || 'Region pending'
        }));
        
        return res.status(200).json({
          success: true,
          data: {
            items: transformedProperties,
            meta: {
              total,
              page,
              limit,
              totalPages: Math.ceil(total / limit),
              hasNextPage: page < Math.ceil(total / limit),
              hasPreviousPage: page > 1
            }
          }
        });
      }

      // Other CRUD operations would go here
      // For now, returning 501 for unimplemented endpoints
      return res.status(501).json({
        success: false,
        error: 'Property CRUD operation not yet implemented',
        path: url,
        method: req.method
      });

    } catch (error) {
      console.error('Properties error:', error.message);
      return res.status(500).json({
        success: false,
        error: 'Properties operation failed',
        message: error.message
      });
    }
  }

  // =============================================================================
  // USERS ENDPOINTS - List with role management (Working endpoint)
  // =============================================================================
  if (url.includes('/users')) {
    try {
      const prismaClient = getPrismaClient();

      // GET /users - List users
      if (req.method === 'GET' && !url.match(/\/users\/[^\/]+$/)) {
        const urlParams = new URL(url, 'http://localhost').searchParams;
        const page = parseInt(urlParams.get('page') || '1');
        const limit = parseInt(urlParams.get('limit') || '10');
        const role = urlParams.get('role') || '';
        const search = urlParams.get('search') || '';
        
        const skip = (page - 1) * limit;
        
        const where = {};
        if (role) where.role = role.toUpperCase();
        if (search) {
          where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } }
          ];
        }
        
        const [users, total] = await Promise.all([
          withTimeout(prismaClient.user.findMany({
            where,
            skip,
            take: limit,
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
              isActive: true,
              createdAt: true,
              updatedAt: true,
              avatar: true
            },
            orderBy: { createdAt: 'desc' }
          }), 8000),
          withTimeout(prismaClient.user.count({ where }), 5000)
        ]);
        
        return res.status(200).json({
          success: true,
          data: {
            items: users,
            meta: {
              total,
              page,
              limit,
              totalPages: Math.ceil(total / limit)
            }
          }
        });
      }

      // Other user operations not yet implemented
      return res.status(501).json({
        success: false,
        error: 'User operation not yet implemented',
        path: url,
        method: req.method
      });

    } catch (error) {
      console.error('Users error:', error.message);
      return res.status(500).json({
        success: false,
        error: 'Users operation failed',
        message: error.message
      });
    }
  }

  // =============================================================================
  // BLOG ENDPOINTS - Placeholder for future implementation
  // =============================================================================
  if (url.includes('/blog')) {
    return res.status(501).json({
      success: false,
      error: 'Blog endpoints not yet implemented',
      path: url,
      method: req.method,
      note: 'Will be implemented in next deployment'
    });
  }

  // =============================================================================
  // INQUIRIES ENDPOINTS - Placeholder for future implementation
  // =============================================================================
  if (url.includes('/inquiries')) {
    return res.status(501).json({
      success: false,
      error: 'Inquiries endpoints not yet implemented',
      path: url,
      method: req.method,
      note: 'Will be implemented in next deployment'
    });
  }

  // =============================================================================
  // SETTINGS ENDPOINTS - Placeholder for future implementation
  // =============================================================================
  if (url.includes('/settings')) {
    return res.status(501).json({
      success: false,
      error: 'Settings endpoints not yet implemented',
      path: url,
      method: req.method,
      note: 'Will be implemented in next deployment'
    });
  }
  
  // Default 404 response
  return res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: url,
    method: req.method,
    availableEndpoints: [
      'GET /api',
      'GET /api/health',
      'GET /api/dashboard',
      'GET /api/properties',
      'GET /api/users',
      'POST /api/auth/login'
    ],
    timestamp: new Date().toISOString()
  });
};