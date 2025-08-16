export default async function handler(req: any, res: any) {
  try {
    // Step 1: Basic response test
    console.log('Handler called for:', req.url);
    
    // Step 2: Test environment variables
    const envCheck = {
      DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'MISSING',
      JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'MISSING',
      NODE_ENV: process.env.NODE_ENV || 'MISSING',
      ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS || 'MISSING'
    };
    console.log('Environment vars:', envCheck);

    // Step 3: Try importing serverless-http
    console.log('Importing serverless-http...');
    const serverless = (await import('serverless-http')).default;
    console.log('serverless-http imported successfully');

    // Step 4: Try importing app
    console.log('Importing app...');
    const { app } = await import('../backend/dist/app.js');
    console.log('App imported successfully');
    
    // Step 5: Create serverless handler
    console.log('Creating serverless handler...');
    const serverlessHandler = serverless(app);
    console.log('Serverless handler created successfully');
    
    // Step 6: Execute handler
    console.log('Executing handler...');
    return serverlessHandler(req, res);
    
  } catch (error) {
    console.error('Handler error at step:', error.message);
    console.error('Full error:', error);
    
    // Return a proper error response
    return res.status(500).json({ 
      error: 'Handler failed', 
      message: error.message,
      stack: error.stack,
      url: req.url,
      method: req.method,
      timestamp: new Date().toISOString()
    });
  }
}
