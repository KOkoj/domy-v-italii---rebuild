import cors, { CorsOptions } from 'cors';

function parseOrigins(envStr?: string): string[] {
  if (!envStr) return [];
  return envStr
    .split(',')
    .map(o => o.trim())
    .filter(Boolean);
}

function originMatches(allowed: string[], origin: string): boolean {
  for (const rule of allowed) {
    // wildcard pattern: https://*.vercel.app
    if (rule.includes('*')) {
      const [scheme, host] = rule.split('://');
      const originUrl = new URL(origin);
      if (!host || !scheme) continue;
      if (originUrl.protocol.replace(':', '') !== scheme) continue;

      // turn "*.vercel.app" into "vercel.app" suffix check
      const suffix = host.replace(/^\*\./, '');
      if (originUrl.hostname === suffix) return true;
      if (originUrl.hostname.endsWith(`.${suffix}`)) return true;
    } else {
      if (origin === rule) return true;
    }
  }
  return false;
}

// Default allowed origins if ALLOWED_ORIGINS env var is not set
const defaultOrigins = [
  'https://rebuilddomy.netlify.app',
  'https://domyvitalii.vercel.app',
  'http://localhost:5173',
  'http://127.0.0.1:5173'
];

const allowedOrigins = parseOrigins(process.env.ALLOWED_ORIGINS) || defaultOrigins;

const corsOptions: CorsOptions = {
  origin: (origin, cb) => {
    // Allow non-browser tools (like curl/postman with no Origin)
    if (!origin) return cb(null, true);

    if (originMatches(allowedOrigins, origin)) return cb(null, true);

    const error: any = new Error(`CORS: Origin not allowed: ${origin}`);
    error.status = 403;
    return cb(error);
  },
  credentials: true, // Required for Authorization headers
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  exposedHeaders: ['Content-Length', 'Content-Type'],
  optionsSuccessStatus: 204, // 204 No Content for preflight success
};

export const corsMiddleware = cors(corsOptions);
export const corsPreflight = cors(corsOptions);
