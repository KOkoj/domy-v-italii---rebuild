// Simple working serverless function for Vercel (ES Module syntax)
export default async (req, res) => {
  try {
    console.log('Function called:', req.method, req.url);
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Content-Type', 'application/json');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      console.log('Handling OPTIONS request');
      return res.status(200).end();
    }
    
    console.log('Processing request for:', req.url);
    
    // Simple responses without complex imports
    if (req.url === '/' || req.url === '/api') {
      return res.status(200).json({
        message: 'Italian Real Estate API',
        version: '1.0.0',
        status: 'Working',
        timestamp: new Date().toISOString()
      });
    }
    
    if (req.url.includes('/health')) {
      return res.status(200).json({
        ok: true,
        message: 'API is healthy',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'production'
      });
    }
    
    if (req.url.includes('/properties')) {
      return res.status(200).json({
        success: true,
        message: 'Properties endpoint working',
        data: {
          items: [],
          total: 0,
          note: 'Backend integration in progress'
        },
        timestamp: new Date().toISOString()
      });
    }
    
    // Default response for unknown routes
    return res.status(200).json({
      message: 'Endpoint working',
      path: req.url,
      method: req.method,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Function error:', error);
    
    // Make sure we always return a response
    return res.status(500).json({
      error: 'Function execution error',
      message: error.message || 'Unknown error',
      timestamp: new Date().toISOString(),
      stack: error.stack
    });
  }
};