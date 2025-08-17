// Serverless function entry point for Vercel deployment
/* eslint-env node */
/* eslint-disable @typescript-eslint/no-var-requires */
const serverless = require('serverless-http');

module.exports = async (req, res) => {
  try {
    // Dynamically import the Express app using tsx for TypeScript support
    const { createRequire } = require('module');
    const require = createRequire(import.meta.url);
    
    // Use tsx to run TypeScript directly
    const { register } = require('tsx/esm');
    await register();
    
    // Import the TypeScript app
    const { app } = await import('../backend/src/app.ts');
    const handler = serverless(app);
    
    return handler(req, res);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Serverless function error:', error);
    
    // Return detailed error for debugging
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message || 'Unknown error',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
  }
};