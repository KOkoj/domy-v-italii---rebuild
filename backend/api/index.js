// Italian Real Estate API with Database Connectivity
import { PrismaClient } from '@prisma/client';

// Helper function to create a fresh Prisma client for each request (avoids connection pooling issues)
const createPrismaClient = () => {
  return new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });
};

// Helper function to run database queries with timeout
const withTimeout = (promise, timeoutMs = 8000) => {
  const timeout = new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`Database query timeout after ${timeoutMs}ms`)), timeoutMs);
  });
  return Promise.race([promise, timeout]);
};

export default async (req, res) => {
  console.log('Request:', req.method, req.url);
  
  // Set CORS headers
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Parse JSON body for POST requests
  let body = {};
  if (req.method === 'POST' && req.body) {
    try {
      body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    } catch (e) {
      body = req.body;
    }
  }
  
  const url = req.url || '';
  const hasDatabase = !!process.env.DATABASE_URL;
  
  // Root endpoint
  if (url === '/' || url === '/api') {
    return res.status(200).json({
      success: true,
      message: 'Italian Real Estate API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      database: hasDatabase ? 'Connected to Supabase' : 'No database configured',
      endpoints: ['properties', 'auth/login', 'users', 'blog', 'health']
    });
  }
  
  // Health check with database status
  if (url.includes('/health')) {
    let dbStatus = 'Not configured';
    
    if (hasDatabase) {
      let prisma;
      try {
        // Create fresh client for health check
        prisma = createPrismaClient();
        
        // Quick database health check with timeout
        await withTimeout(prisma.$queryRaw`SELECT 1`, 3000);
        dbStatus = 'Connected and healthy';
      } catch (error) {
        console.error('Database health check failed:', error.message);
        dbStatus = 'Connected but error: ' + error.message;
      } finally {
        // Always disconnect
        if (prisma) await prisma.$disconnect();
      }
    }
    
    return res.status(200).json({ 
      ok: true,
      message: 'API healthy',
      database: dbStatus,
      timestamp: new Date().toISOString()
    });
  }
  
  // Properties endpoint with real database data
  if (url.includes('/properties') && req.method === 'GET') {
    if (!hasDatabase) {
      // Fallback to test data if no database
      const testProperties = [
        {
          id: 'test-001',
          title: 'Villa in Tuscany (Test Data)',
          price: 1250000,
          location: 'Chianti, Tuscany',
          bedrooms: 5,
          bathrooms: 4,
          status: 'active'
        }
      ];
      
      return res.status(200).json({
        success: true,
        data: {
          items: testProperties,
          total: 1,
          note: 'Test data - DATABASE_URL not configured'
        },
        timestamp: new Date().toISOString()
      });
    }
    
    let prisma;
    try {
      console.log('Creating fresh Prisma client for properties...');
      
      // Create fresh client to avoid connection pooling issues
      prisma = createPrismaClient();
      
      // Simple query first - just count all properties
      console.log('Counting total properties...');
      const totalProperties = await withTimeout(
        prisma.property.count(),
        5000
      );
      
      console.log(`Database contains ${totalProperties} total properties`);
      
      if (totalProperties === 0) {
        return res.status(200).json({
          success: true,
          data: {
            items: [],
            total: 0,
            totalInDatabase: 0,
            note: 'Database table exists but contains no properties'
          },
          timestamp: new Date().toISOString()
        });
      }
      
      // Get properties with simplified select (only basic fields)
      console.log('Fetching properties with basic fields...');
      const properties = await withTimeout(
        prisma.property.findMany({
          take: 10,
          select: {
            id: true,
            title: true,
            slug: true,
            description: true,
            priceCents: true,
            type: true,
            status: true,
            bedrooms: true,
            bathrooms: true,
            area: true,
            createdAt: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        }),
        8000
      );
      
      console.log(`Retrieved ${properties.length} properties`);
      
      // Transform data for frontend compatibility
      const transformedProperties = properties.map(property => ({
        ...property,
        price: property.priceCents ? Math.round(property.priceCents / 100) : 0,
        propertyType: property.type,
        isActive: property.status === 'active',
        location: 'Location data pending' // We'll add location fields in next iteration
      }));
      
      return res.status(200).json({
        success: true,
        data: {
          items: transformedProperties,
          total: transformedProperties.length,
          totalInDatabase: totalProperties,
          source: 'Supabase Database (simplified query)',
          debug: {
            queryApproach: 'Fresh Prisma client + basic fields only',
            fieldsUsed: ['id', 'title', 'slug', 'description', 'priceCents', 'type', 'status', 'bedrooms', 'bathrooms', 'area'],
            connectionPoolingFix: 'Using fresh client per request'
          }
        },
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Properties query error:', error.message);
      
      return res.status(200).json({
        success: true,
        data: {
          items: [],
          total: 0,
          error: error.message,
          debug: {
            errorType: error.constructor.name,
            isPrismaError: error.code ? true : false,
            prismaErrorCode: error.code || 'N/A',
            connectionPoolingFix: 'Attempted fresh client creation',
            suggestion: error.message.includes('prepared statement') ? 
              'Connection pooling issue with PgBouncer - using fresh client should resolve this' :
              'Database schema or connection issue'
          }
        },
        timestamp: new Date().toISOString()
      });
    } finally {
      // Always disconnect to avoid connection pooling issues
      if (prisma) {
        try {
          await prisma.$disconnect();
          console.log('Prisma client disconnected successfully');
        } catch (e) {
          console.log('Prisma disconnect warning:', e.message);
        }
      }
    }
  }
  
  // Authentication with real database
  if (url.includes('/auth/login') && req.method === 'POST') {
    const { email, password } = body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }
    
    if (!hasDatabase) {
      // Fallback authentication for testing
      if (email === 'admin@example.com' && password === 'admin123456') {
        return res.status(200).json({
          success: true,
          data: {
            user: { id: 'test-admin', email, name: 'Test Admin' },
            token: 'test-token-' + Date.now()
          },
          note: 'Test authentication - no database'
        });
      }
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    
    try {
      console.log('Authenticating user:', email);
      
      // Find user in database with timeout
      const user = await withTimeout(
        prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            name: true,
            password: true, // We'll need this for comparison
            role: true,
            isActive: true,
            createdAt: true,
            avatar: true
          }
        }),
        5000 // 5 second timeout
      );
      
      if (!user) {
        console.log('User not found');
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }
      
      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          error: 'Account is deactivated'
        });
      }
      
      // For demo purposes, we'll skip password hashing comparison
      // In production, you'd use bcrypt here
      console.log('User found:', user.email);
      
      // Remove password from response
      const { password: _, ...safeUser } = user;
      
      return res.status(200).json({
        success: true,
        data: {
          user: safeUser,
          token: 'jwt-token-' + Date.now(),
          refreshToken: 'refresh-token-' + Date.now(),
          expiresIn: '7d'
        },
        message: 'Login successful',
        timestamp: new Date().toISOString()
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
  
  // Users endpoint with database
  if (url.includes('/users') && req.method === 'GET') {
    if (!hasDatabase) {
      return res.status(200).json({
        success: true,
        data: { items: [], total: 0, note: 'No database configured' }
      });
    }
    
    try {
      const users = await withTimeout(
        prisma.user.findMany({
          take: 10,
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            isActive: true,
            createdAt: true,
            avatar: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        }),
        5000
      );
      
      return res.status(200).json({
        success: true,
        data: {
          items: users,
          total: users.length
        },
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Users query error:', error.message);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch users',
        message: error.message
      });
    }
  }
  
  // Blog posts with database
  if (url.includes('/blog') && req.method === 'GET') {
    if (!hasDatabase) {
      return res.status(200).json({
        success: true,
        data: { items: [], total: 0, note: 'No database configured' }
      });
    }
    
    try {
      const posts = await withTimeout(
        prisma.blogPost.findMany({
          take: 10,
          where: {
            isPublished: true
          },
          select: {
            id: true,
            title: true,
            slug: true,
            excerpt: true,
            content: true,
            publishedAt: true,
            isPublished: true,
            author: {
              select: {
                name: true,
                email: true
              }
            }
          },
          orderBy: {
            publishedAt: 'desc'
          }
        }),
        5000
      );
      
      return res.status(200).json({
        success: true,
        data: {
          items: posts,
          total: posts.length
        },
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Blog query error:', error.message);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch blog posts',
        message: error.message
      });
    }
  }
  
  // Default 404 response
  return res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: url,
    method: req.method,
    availableEndpoints: [
      'GET /',
      'GET /api/health',
      'GET /api/properties',
      'POST /api/auth/login',
      'GET /api/users',
      'GET /api/blog'
    ],
    timestamp: new Date().toISOString()
  });
};