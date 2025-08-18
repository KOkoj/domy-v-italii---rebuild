// Italian Real Estate API - Express-like without serverless-http
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
  
  console.log('Processing:', req.method, req.url);
  
  // Route handling (Express-like)
  const url = req.url || '';
  
  // Root endpoint
  if (url === '/' || url === '/api') {
    return res.status(200).json({
      success: true,
      message: 'Italian Real Estate API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      framework: 'Custom routing (no Express)'
    });
  }
  
  // Health check
  if (url.includes('/health')) {
    return res.status(200).json({ 
      ok: true,
      message: 'API healthy - no Express/serverless-http',
      timestamp: new Date().toISOString()
    });
  }
  
  // Properties endpoint
  if (url.includes('/properties') && req.method === 'GET') {
    const testProperties = [
      {
        id: 'prop-001',
        title: 'Elegant Villa in Tuscany',
        description: 'Beautiful countryside villa with vineyard views',
        price: 1250000,
        location: 'Chianti, Tuscany',
        bedrooms: 5,
        bathrooms: 4,
        area: 320,
        type: 'Villa',
        features: ['Swimming Pool', 'Garden', 'Wine Cellar', 'Parking']
      },
      {
        id: 'prop-002',
        title: 'Modern Apartment in Milan Center',
        description: 'Luxury apartment in the heart of Milan',
        price: 850000,
        location: 'Brera, Milan',
        bedrooms: 3,
        bathrooms: 2,
        area: 150,
        type: 'Apartment',
        features: ['Balcony', 'Modern Kitchen', 'Air Conditioning', 'Elevator']
      },
      {
        id: 'prop-003',
        title: 'Historic Palazzo in Rome',
        description: 'Restored historic building near Colosseum',
        price: 2100000,
        location: 'Centro Storico, Rome',
        bedrooms: 6,
        bathrooms: 5,
        area: 450,
        type: 'Palazzo',
        features: ['Historic Features', 'Terrace', 'Original Frescoes', 'Courtyard']
      },
      {
        id: 'prop-004',
        title: 'Waterfront Villa in Amalfi Coast',
        description: 'Stunning villa with direct sea access',
        price: 3500000,
        location: 'Positano, Amalfi Coast',
        bedrooms: 4,
        bathrooms: 3,
        area: 280,
        type: 'Villa',
        features: ['Sea View', 'Private Beach', 'Infinity Pool', 'Boat Dock']
      }
    ];
    
    return res.status(200).json({
      success: true,
      data: {
        items: testProperties,
        total: testProperties.length,
        page: 1,
        totalPages: 1,
        note: 'Rich test data - no database connection yet'
      },
      timestamp: new Date().toISOString()
    });
  }
  
  // Authentication endpoint
  if (url.includes('/auth/login') && req.method === 'POST') {
    const { email, password } = body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required',
        timestamp: new Date().toISOString()
      });
    }
    
    // Test authentication
    if (email === 'admin@example.com' && password === 'admin123456') {
      return res.status(200).json({
        success: true,
        data: {
          user: {
            id: 'user-admin-001',
            email: 'admin@example.com',
            name: 'Administrator',
            role: 'admin',
            permissions: ['read', 'write', 'delete'],
            avatar: null,
            createdAt: '2024-01-01T00:00:00.000Z',
            isActive: true
          },
          token: 'jwt-token-' + Date.now(),
          refreshToken: 'refresh-token-' + Date.now(),
          expiresIn: '7d'
        },
        message: 'Login successful',
        timestamp: new Date().toISOString()
      });
    }
    
    // Invalid credentials
    return res.status(401).json({
      success: false,
      error: 'Invalid email or password',
      hint: 'Try: admin@example.com / admin123456',
      timestamp: new Date().toISOString()
    });
  }
  
  // Users endpoint (for testing)
  if (url.includes('/users') && req.method === 'GET') {
    return res.status(200).json({
      success: true,
      data: {
        items: [
          {
            id: 'user-001',
            email: 'admin@example.com',
            name: 'Administrator',
            role: 'admin',
            isActive: true,
            createdAt: '2024-01-01T00:00:00.000Z'
          }
        ],
        total: 1
      },
      timestamp: new Date().toISOString()
    });
  }
  
  // Blog posts endpoint (for testing)
  if (url.includes('/blog') && req.method === 'GET') {
    return res.status(200).json({
      success: true,
      data: {
        items: [
          {
            id: 'blog-001',
            title: 'Guide to Buying Property in Italy',
            slug: 'guide-buying-property-italy',
            excerpt: 'Everything you need to know about purchasing real estate in Italy',
            content: 'Complete guide content...',
            publishedAt: '2024-08-01T00:00:00.000Z',
            isPublished: true
          }
        ],
        total: 1
      },
      timestamp: new Date().toISOString()
    });
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