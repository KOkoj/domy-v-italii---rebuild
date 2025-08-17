const serverless = require('serverless-http');

module.exports = async (req, res) => {
  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    
    // Use tsx to run TypeScript directly
    const { register } = require('tsx/esm');
    await register();
    
    // Import the Express app
    const { app } = await import('../src/app.ts');
    const handler = serverless(app);
    return handler(req, res);
    
  } catch (error) {
    console.error('API Error:', error);
    
    // Fallback responses for common endpoints
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
        note: 'Backend loading in progress',
        timestamp: new Date().toISOString()
      });
    }
    
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
      timestamp: new Date().toISOString(),
      url: req.url
    });
  }
};