import serverless from 'serverless-http';
import { app } from '../src/app.js';

// Vercel serverless function handler
export default serverless(app);
