import serverless from 'serverless-http';
import { app } from '../src/app';

// Vercel serverless function handler
export default serverless(app);
