import serverless from 'serverless-http';

// Simple test to isolate the issue
export default function handler(req: any, res: any) {
  try {
    // Try to import the app
    const { app } = require('../dist/app.js');
    const serverlessHandler = serverless(app);
    return serverlessHandler(req, res);
  } catch (error) {
    console.error('Error loading app:', error);
    res.status(500).json({ 
      error: 'Failed to load app', 
      message: error.message,
      stack: error.stack 
    });
  }
}
