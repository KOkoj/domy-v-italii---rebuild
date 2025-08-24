import serverless from 'serverless-http';

export default async function handler(req: any, res: any) {
  try {
    const { app } = await import('../src/app.js');
    const serverlessHandler = serverless(app);
    return serverlessHandler(req, res);
  } catch (error: any) {
    console.error('Serverless handler error:', error);
    return res.status(500).json({ 
      error: 'Handler failed', 
      message: error.message 
    });
  }
}