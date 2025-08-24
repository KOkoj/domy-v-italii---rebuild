import serverless from 'serverless-http';
import { app } from '../src/app.js';

// Create the serverless handler
const handler = serverless(app);

export default handler;