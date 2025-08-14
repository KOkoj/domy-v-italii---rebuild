import cors, { CorsOptions } from 'cors';

function parseOrigins(envStr?: string): string[] {
  if (!envStr) return [];
  return envStr
    .split(',')
    .map(o => o.trim().toLowerCase())
    .filter(Boolean);
}

function originMatches(allowed: string[], origin: string): boolean {
  const o = origin.toLowerCase();

  for (const rule of allowed) {
    const r = rule.toLowerCase();

    // wildcard pattern e.g. https://*.vercel.app
    if (r.includes('*')) {
      const [scheme, host] = r.split('://');
      try {
        const u = new URL(o);
        if (!scheme || !host) continue;
        if (u.protocol.replace(':', '') !== scheme) continue;

        const suffix = host.replace(/^\*\./, ''); // "*.vercel.app" -> "vercel.app"
        if (u.hostname === suffix) return true;
        if (u.hostname.endsWith(`.${suffix}`)) return true;
      } catch {
        continue;
      }
    } else {
      if (o === r) return true;
    }
  }
  return false;
}

// Safe defaults for local/dev if env not set
const defaultOrigins = [
  'https://rebuilddomy.netlify.app',
  'https://domyvitalii.vercel.app',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
].map(s => s.toLowerCase());

// Use env if present, else defaults
const envOrigins = parseOrigins(process.env.ALLOWED_ORIGINS);
const allowedOrigins = envOrigins.length ? envOrigins : defaultOrigins;

const corsOptions: CorsOptions = {
  origin: (origin, cb) => {
    // Allow non-browser tools (no Origin header)
    if (!origin) return cb(null, true);

    if (originMatches(allowedOrigins, origin)) {
      return cb(null, true);
    }

    const err: any = new Error(`CORS: Origin not allowed: ${origin}`);
    err.status = 403;
    return cb(err);
  },
  credentials: true,
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
  ],
  exposedHeaders: ['Content-Length', 'Content-Type'],
  optionsSuccessStatus: 204, // if you see issues, change to 200
};

export const corsMiddleware = cors(corsOptions);
export const corsPreflight = cors(corsOptions);
