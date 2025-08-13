import cors from 'cors';
import { env } from '../env.js';

export function corsMiddleware() {
  // Parse allowed origins from environment variable
  const allowedOrigins = env.ALLOWED_ORIGINS
    ? env.ALLOWED_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean)
    : ['http://localhost:5173', 'http://127.0.0.1:5173'];

  return cors({
    origin(origin, cb) {
      // Allow requests with no origin (mobile apps, curl, Postman)
      if (!origin) return cb(null, true);

      // Check if origin is in allowed list
      if (allowedOrigins.includes(origin)) {
        return cb(null, true);
      }

      // In development, be more permissive for localhost variations
      if (env.NODE_ENV === 'development' && origin.includes('localhost')) {
        return cb(null, true);
      }

      // Block unauthorized origins
      const error = new Error(`CORS: Origin ${origin} not allowed`);
      (error as any).status = 403;
      return cb(error);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });
}
