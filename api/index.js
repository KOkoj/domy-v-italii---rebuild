/* eslint-disable no-undef, no-console, no-useless-escape */
// Italian Real Estate API with Database Connectivity - Complete
const { PrismaClient } = require('@prisma/client');

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

// Parse request body helper
const parseBody = (req) => {
  if (req.method === 'POST' || req.method === 'PUT') {
    if (req.body) {
      return typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    }
  }
  return {};
};

const handler = async (req, res) => {
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
      message: 'Italian Real Estate API - Complete',
      version: '2.0.0',
      timestamp: new Date().toISOString(),
      database: hasDatabase ? 'Connected to Supabase' : 'No database configured',
      endpoints: ['dashboard', 'properties', 'blog', 'inquiries', 'users', 'settings', 'auth/login', 'health']
    });
  }
  
  // Health check with database status
  if (url.includes('/health')) {
    let dbStatus = 'Not configured';
    
    if (hasDatabase) {
      let prisma;
      try {
        prisma = createPrismaClient();
        await withTimeout(prisma.$queryRaw`SELECT 1`, 3000);
        dbStatus = 'Connected and healthy';
      } catch (error) {
        console.error('Database health check failed:', error.message);
        dbStatus = 'Connected but error: ' + error.message;
      } finally {
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
    
    let prisma;
    try {
      prisma = createPrismaClient();
      
      // Get counts for stats
      const [propertiesCount, activePropertiesCount, draftsCount, inquiriesCount, inquiriesWeekCount] = await Promise.all([
        withTimeout(prisma.property.count(), 5000),
        withTimeout(prisma.property.count({ where: { status: 'ACTIVE' } }), 5000),
        withTimeout(prisma.blogPost.count({ where: { status: 'DRAFT' } }), 5000),
        withTimeout(prisma.inquiry.count({ 
          where: { 
            createdAt: { 
              gte: new Date(new Date().setHours(0, 0, 0, 0))
            } 
          } 
        }), 5000),
        withTimeout(prisma.inquiry.count({ 
          where: { 
            createdAt: { 
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            } 
          } 
        }), 5000)
      ]);

      // Get recent activity
      const [recentProperties, recentBlogPosts, recentInquiries] = await Promise.all([
        withTimeout(prisma.property.findMany({
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
        withTimeout(prisma.blogPost.findMany({
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
        withTimeout(prisma.inquiry.findMany({
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
    } finally {
      if (prisma) await prisma.$disconnect();
    }
  }

  // =============================================================================
  // PROPERTIES ENDPOINTS - Full CRUD
  // =============================================================================
  if (url.includes('/properties')) {
    let prisma;
    
    try {
      prisma = createPrismaClient();

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
          withTimeout(prisma.property.findMany({
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
          withTimeout(prisma.property.count({ where }), 5000)
        ]);
        
        const transformedProperties = properties.map(property => ({
          ...property,
          priceEuro: Math.round(property.priceCents / 100),
          isActive: property.status === 'ACTIVE'
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

      // GET /properties/:id - Get single property
      if (req.method === 'GET' && url.match(/\/properties\/([^\/]+)$/)) {
        const id = url.match(/\/properties\/([^\/]+)$/)[1];
        
        const property = await withTimeout(prisma.property.findUnique({
          where: { id },
          include: {
            author: {
              select: { id: true, name: true, email: true }
            }
          }
        }), 5000);
        
        if (!property) {
          return res.status(404).json({
            success: false,
            error: 'Property not found'
          });
        }
        
        return res.status(200).json({
          success: true,
          data: {
            ...property,
            priceEuro: Math.round(property.priceCents / 100),
            isActive: property.status === 'ACTIVE'
          }
        });
      }

      // POST /properties - Create property
      if (req.method === 'POST') {
        const { title, description, priceCents, type, address, city, region, postalCode, bedrooms, bathrooms, area, lotSize, yearBuilt, features = [] } = body;
        
        // Generate slug from title
        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        
        // For demo, use a default author ID (first user in DB)
        const firstUser = await withTimeout(prisma.user.findFirst(), 3000);
        if (!firstUser) {
          return res.status(400).json({
            success: false,
            error: 'No users found. Please create a user first.'
          });
        }
        
        const property = await withTimeout(prisma.property.create({
          data: {
            title,
            slug,
            description,
            priceCents: parseInt(priceCents),
            type,
            address,
            city,
            region,
            postalCode,
            bedrooms: parseInt(bedrooms),
            bathrooms: parseInt(bathrooms),
            area: parseInt(area),
            lotSize: lotSize ? parseInt(lotSize) : null,
            yearBuilt: yearBuilt ? parseInt(yearBuilt) : null,
            features,
            images: [],
            authorId: firstUser.id
          },
          include: {
            author: {
              select: { name: true, email: true }
            }
          }
        }), 8000);
        
        return res.status(201).json({
          success: true,
          data: {
            ...property,
            priceEuro: Math.round(property.priceCents / 100)
          },
          message: 'Property created successfully'
        });
      }

      // PUT /properties/:id - Update property
      if (req.method === 'PUT' && url.match(/\/properties\/([^\/]+)$/)) {
        const id = url.match(/\/properties\/([^\/]+)$/)[1];
        
        const updateData = { ...body };
        if (updateData.priceCents) updateData.priceCents = parseInt(updateData.priceCents);
        if (updateData.bedrooms) updateData.bedrooms = parseInt(updateData.bedrooms);
        if (updateData.bathrooms) updateData.bathrooms = parseInt(updateData.bathrooms);
        if (updateData.area) updateData.area = parseInt(updateData.area);
        if (updateData.lotSize) updateData.lotSize = parseInt(updateData.lotSize);
        if (updateData.yearBuilt) updateData.yearBuilt = parseInt(updateData.yearBuilt);
        
        delete updateData.id;
        delete updateData.createdAt;
        delete updateData.updatedAt;
        delete updateData.author;
        
        const property = await withTimeout(prisma.property.update({
          where: { id },
          data: updateData,
          include: {
            author: {
              select: { name: true, email: true }
            }
          }
        }), 8000);
        
        return res.status(200).json({
          success: true,
          data: {
            ...property,
            priceEuro: Math.round(property.priceCents / 100)
          },
          message: 'Property updated successfully'
        });
      }

      // DELETE /properties/:id - Delete property
      if (req.method === 'DELETE' && url.match(/\/properties\/([^\/]+)$/)) {
        const id = url.match(/\/properties\/([^\/]+)$/)[1];
        
        await withTimeout(prisma.property.delete({
          where: { id }
        }), 5000);
        
        return res.status(200).json({
          success: true,
          message: 'Property deleted successfully'
        });
      }

    } catch (error) {
      console.error('Properties error:', error.message);
      return res.status(500).json({
        success: false,
        error: 'Properties operation failed',
        message: error.message
      });
    } finally {
      if (prisma) await prisma.$disconnect();
    }
  }

  // =============================================================================
  // BLOG ENDPOINTS - Full CRUD
  // =============================================================================
  if (url.includes('/blog')) {
    let prisma;
    
    try {
      prisma = createPrismaClient();

      // GET /blog - List posts with filters
      if (req.method === 'GET' && !url.match(/\/blog\/[^\/]+$/)) {
        const urlParams = new URL(url, 'http://localhost').searchParams;
        const page = parseInt(urlParams.get('page') || '1');
        const limit = parseInt(urlParams.get('limit') || '10');
        const status = urlParams.get('status') || '';
        const search = urlParams.get('search') || '';
        
        const skip = (page - 1) * limit;
        
        const where = {};
        if (status) where.status = status.toUpperCase();
        if (search) {
          where.OR = [
            { title: { contains: search, mode: 'insensitive' } },
            { content: { contains: search, mode: 'insensitive' } }
          ];
        }
        
        const [posts, total] = await Promise.all([
          withTimeout(prisma.blogPost.findMany({
            where,
            skip,
            take: limit,
            include: {
              author: {
                select: { id: true, name: true, email: true }
              }
            },
            orderBy: { createdAt: 'desc' }
          }), 8000),
          withTimeout(prisma.blogPost.count({ where }), 5000)
        ]);
        
        return res.status(200).json({
          success: true,
          data: {
            items: posts,
            meta: {
              total,
              page,
              limit,
              totalPages: Math.ceil(total / limit)
            }
          }
        });
      }

      // GET /blog/:id - Get single post
      if (req.method === 'GET' && url.match(/\/blog\/([^\/]+)$/)) {
        const id = url.match(/\/blog\/([^\/]+)$/)[1];
        
        const post = await withTimeout(prisma.blogPost.findUnique({
          where: { id },
          include: {
            author: {
              select: { id: true, name: true, email: true }
            }
          }
        }), 5000);
        
        if (!post) {
          return res.status(404).json({
            success: false,
            error: 'Blog post not found'
          });
        }
        
        return res.status(200).json({
          success: true,
          data: post
        });
      }

      // POST /blog - Create post
      if (req.method === 'POST') {
        const { title, content, status = 'DRAFT', coverImage = null } = body;
        
        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        
        const firstUser = await withTimeout(prisma.user.findFirst(), 3000);
        if (!firstUser) {
          return res.status(400).json({
            success: false,
            error: 'No users found. Please create a user first.'
          });
        }
        
        const post = await withTimeout(prisma.blogPost.create({
          data: {
            title,
            slug,
            content,
            status: status.toUpperCase(),
            coverImage,
            authorId: firstUser.id
          },
          include: {
            author: {
              select: { name: true, email: true }
            }
          }
        }), 8000);
        
        return res.status(201).json({
          success: true,
          data: post,
          message: 'Blog post created successfully'
        });
      }

      // PUT /blog/:id - Update post
      if (req.method === 'PUT' && url.match(/\/blog\/([^\/]+)$/)) {
        const id = url.match(/\/blog\/([^\/]+)$/)[1];
        
        const updateData = { ...body };
        if (updateData.status) updateData.status = updateData.status.toUpperCase();
        
        delete updateData.id;
        delete updateData.createdAt;
        delete updateData.updatedAt;
        delete updateData.author;
        
        const post = await withTimeout(prisma.blogPost.update({
          where: { id },
          data: updateData,
          include: {
            author: {
              select: { name: true, email: true }
            }
          }
        }), 8000);
        
        return res.status(200).json({
          success: true,
          data: post,
          message: 'Blog post updated successfully'
        });
      }

      // DELETE /blog/:id - Delete post
      if (req.method === 'DELETE' && url.match(/\/blog\/([^\/]+)$/)) {
        const id = url.match(/\/blog\/([^\/]+)$/)[1];
        
        await withTimeout(prisma.blogPost.delete({
          where: { id }
        }), 5000);
        
        return res.status(200).json({
          success: true,
          message: 'Blog post deleted successfully'
        });
      }

    } catch (error) {
      console.error('Blog error:', error.message);
      return res.status(500).json({
        success: false,
        error: 'Blog operation failed',
        message: error.message
      });
    } finally {
      if (prisma) await prisma.$disconnect();
    }
  }

  // =============================================================================
  // INQUIRIES ENDPOINTS - Full CRUD
  // =============================================================================
  if (url.includes('/inquiries')) {
    let prisma;
    
    try {
      prisma = createPrismaClient();

      // GET /inquiries - List with filters
      if (req.method === 'GET' && !url.match(/\/inquiries\/[^\/]+$/)) {
        const urlParams = new URL(url, 'http://localhost').searchParams;
        const page = parseInt(urlParams.get('page') || '1');
        const limit = parseInt(urlParams.get('limit') || '10');
        const status = urlParams.get('status') || '';
        const search = urlParams.get('search') || '';
        
        const skip = (page - 1) * limit;
        
        const where = {};
        if (status) where.status = status.toUpperCase();
        if (search) {
          where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { message: { contains: search, mode: 'insensitive' } }
          ];
        }
        
        const [inquiries, total] = await Promise.all([
          withTimeout(prisma.inquiry.findMany({
            where,
            skip,
            take: limit,
            include: {
              property: {
                select: { id: true, title: true, city: true }
              }
            },
            orderBy: { createdAt: 'desc' }
          }), 8000),
          withTimeout(prisma.inquiry.count({ where }), 5000)
        ]);
        
        return res.status(200).json({
          success: true,
          data: {
            items: inquiries,
            meta: {
              total,
              page,
              limit,
              totalPages: Math.ceil(total / limit)
            }
          }
        });
      }

      // GET /inquiries/:id - Get single inquiry
      if (req.method === 'GET' && url.match(/\/inquiries\/([^\/]+)$/)) {
        const id = url.match(/\/inquiries\/([^\/]+)$/)[1];
        
        const inquiry = await withTimeout(prisma.inquiry.findUnique({
          where: { id },
          include: {
            property: {
              select: { id: true, title: true, city: true, region: true }
            }
          }
        }), 5000);
        
        if (!inquiry) {
          return res.status(404).json({
            success: false,
            error: 'Inquiry not found'
          });
        }
        
        return res.status(200).json({
          success: true,
          data: inquiry
        });
      }

      // POST /inquiries - Create inquiry
      if (req.method === 'POST') {
        const { name, email, phone = null, message, propertyId = null } = body;
        
        const inquiry = await withTimeout(prisma.inquiry.create({
          data: {
            name,
            email,
            phone,
            message,
            propertyId
          },
          include: {
            property: {
              select: { title: true, city: true }
            }
          }
        }), 8000);
        
        return res.status(201).json({
          success: true,
          data: inquiry,
          message: 'Inquiry created successfully'
        });
      }

      // PUT /inquiries/:id - Update inquiry (mainly status)
      if (req.method === 'PUT' && url.match(/\/inquiries\/([^\/]+)$/)) {
        const id = url.match(/\/inquiries\/([^\/]+)$/)[1];
        
        const updateData = { ...body };
        if (updateData.status) updateData.status = updateData.status.toUpperCase();
        
        delete updateData.id;
        delete updateData.createdAt;
        delete updateData.property;
        
        const inquiry = await withTimeout(prisma.inquiry.update({
          where: { id },
          data: updateData,
          include: {
            property: {
              select: { title: true, city: true }
            }
          }
        }), 8000);
        
        return res.status(200).json({
          success: true,
          data: inquiry,
          message: 'Inquiry updated successfully'
        });
      }

      // DELETE /inquiries/:id - Delete inquiry
      if (req.method === 'DELETE' && url.match(/\/inquiries\/([^\/]+)$/)) {
        const id = url.match(/\/inquiries\/([^\/]+)$/)[1];
        
        await withTimeout(prisma.inquiry.delete({
          where: { id }
        }), 5000);
        
        return res.status(200).json({
          success: true,
          message: 'Inquiry deleted successfully'
        });
      }

    } catch (error) {
      console.error('Inquiries error:', error.message);
      return res.status(500).json({
        success: false,
        error: 'Inquiries operation failed',
        message: error.message
      });
    } finally {
      if (prisma) await prisma.$disconnect();
    }
  }

  // =============================================================================
  // USERS ENDPOINTS - List and role management
  // =============================================================================
  if (url.includes('/users')) {
    let prisma;
    
    try {
      prisma = createPrismaClient();

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
          withTimeout(prisma.user.findMany({
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
          withTimeout(prisma.user.count({ where }), 5000)
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

      // PUT /users/:id - Update user (mainly role)
      if (req.method === 'PUT' && url.match(/\/users\/([^\/]+)$/)) {
        const id = url.match(/\/users\/([^\/]+)$/)[1];
        
        const updateData = { ...body };
        if (updateData.role) updateData.role = updateData.role.toUpperCase();
        
        delete updateData.id;
        delete updateData.password; // Don't allow password updates through this endpoint
        delete updateData.createdAt;
        delete updateData.updatedAt;
        
        const user = await withTimeout(prisma.user.update({
          where: { id },
          data: updateData,
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
            avatar: true
          }
        }), 8000);
        
        return res.status(200).json({
          success: true,
          data: user,
          message: 'User updated successfully'
        });
      }

    } catch (error) {
      console.error('Users error:', error.message);
      return res.status(500).json({
        success: false,
        error: 'Users operation failed',
        message: error.message
      });
    } finally {
      if (prisma) await prisma.$disconnect();
    }
  }

  // =============================================================================
  // SETTINGS ENDPOINTS - App configuration
  // =============================================================================
  if (url.includes('/settings')) {
    let prisma;
    
    try {
      prisma = createPrismaClient();

      // GET /settings - Get all settings
      if (req.method === 'GET') {
        const settings = await withTimeout(prisma.setting.findMany(), 5000);
        
        // Convert to key-value object
        const settingsObj = {};
        settings.forEach(setting => {
          settingsObj[setting.key] = setting.value;
        });
        
        // Provide defaults if settings don't exist
        const defaultSettings = {
          siteName: 'Italian Real Estate',
          contactEmail: 'admin@example.com',
          currency: 'EUR',
          locale: 'it-IT',
          ...settingsObj
        };
        
        return res.status(200).json({
          success: true,
          data: defaultSettings
        });
      }

      // PUT /settings - Update settings
      if (req.method === 'PUT') {
        const updates = body;
        
        // Update each setting
        for (const [key, value] of Object.entries(updates)) {
          await withTimeout(prisma.setting.upsert({
            where: { key },
            update: { value },
            create: { key, value }
          }), 5000);
        }
        
        return res.status(200).json({
          success: true,
          message: 'Settings updated successfully'
        });
      }

    } catch (error) {
      console.error('Settings error:', error.message);
      return res.status(500).json({
        success: false,
        error: 'Settings operation failed',
        message: error.message
      });
    } finally {
      if (prisma) await prisma.$disconnect();
    }
  }

  // =============================================================================
  // AUTHENTICATION ENDPOINT
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
    
    let prisma;
    try {
      console.log('Authenticating user:', email);
      
      // Create fresh Prisma client for authentication
      prisma = createPrismaClient();
      
      const user = await withTimeout(
        prisma.user.findUnique({
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
        message: error.message
      });
    } finally {
      if (prisma) await prisma.$disconnect();
    }
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
      'GET,POST,PUT,DELETE /api/properties',
      'GET,POST,PUT,DELETE /api/blog', 
      'GET,POST,PUT,DELETE /api/inquiries',
      'GET,PUT /api/users',
      'GET,PUT /api/settings',
      'POST /api/auth/login'
    ],
    timestamp: new Date().toISOString()
  });
};

module.exports = handler;