import serverless from 'serverless-http';

export default async function handler(req: any, res: any) {
  try {
    console.log('Handler called, checking environment...');
    console.log('Environment vars:', {
      DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'MISSING',
      JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'MISSING',
      NODE_ENV: process.env.NODE_ENV,
      ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS
    });

    console.log('Importing app...');
    const { app } = await import('../dist/app.js');
    console.log('App imported successfully');
    
    const serverlessHandler = serverless(app);
    console.log('Serverless handler created');
    
    return serverlessHandler(req, res);
  } catch (error) {
    console.error('Handler error:', error);
    return res.status(500).json({ 
      error: 'Handler failed', 
      message: error.message,
      stack: error.stack,
      url: req.url,
      method: req.method
    });
  }
}
