// backend/src/config/cors.ts (or .js)
import cors from 'cors';

const allowedOrigins = [
  'https://rebuilddomy.netlify.app', // Your Netlify frontend
  'http://localhost:3000',
  'http://localhost:5173', // Vite dev server
  'http://localhost:5174', // Alternative Vite port
];

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'Pragma'
  ],
  exposedHeaders: ['Set-Cookie'],
  maxAge: 86400, // 24 hours
};

export const corsMiddleware = cors(corsOptions);
export const corsPreflight = cors(corsOptions);

export default app;