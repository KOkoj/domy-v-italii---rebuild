import serverless from 'serverless-http';
import { app } from '../dist/app.js';

// Vercel serverless function handler
export default serverless(app);

