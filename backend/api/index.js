// Minimal test serverless function
export default async (req, res) => {
  console.log('Function called:', req.method, req.url);
  
  // Set headers
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle OPTIONS
  if (req.method === 'OPTIONS') {
    console.log('OPTIONS request');
    return res.status(200).end();
  }
  
  console.log('Returning response...');
  
  // Simple response based on URL
  if (req.url === '/' || req.url === '/api') {
    return res.status(200).json({
      message: 'Italian Real Estate API',
      status: 'working',
      timestamp: new Date().toISOString(),
      url: req.url
    });
  }
  
  if (req.url.includes('/health')) {
    return res.status(200).json({
      ok: true,
      message: 'API healthy',
      timestamp: new Date().toISOString()
    });
  }
  
  if (req.url.includes('/properties')) {
    return res.status(200).json({
      success: true,
      data: {
        items: [
          { id: 1, title: 'Test Property 1', price: 250000 },
          { id: 2, title: 'Test Property 2', price: 350000 }
        ],
        total: 2,
        note: 'Test data - no database'
      },
      timestamp: new Date().toISOString()
    });
  }
  
  if (req.url.includes('/auth/login')) {
    return res.status(200).json({
      success: true,
      data: {
        user: { id: 1, email: 'test@example.com', name: 'Test User' },
        token: 'test-token-' + Date.now()
      },
      note: 'Test login - no database',
      timestamp: new Date().toISOString()
    });
  }
  
  // Default response
  return res.status(200).json({
    message: 'Endpoint working',
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });
};