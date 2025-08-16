export default async function handler(req: any, res: any) {
  // Minimal diagnostic handler to isolate crashes
  const envCheck = {
    DATABASE_URL: Boolean(process.env.DATABASE_URL),
    JWT_SECRET: Boolean(process.env.JWT_SECRET),
    NODE_ENV: process.env.NODE_ENV || 'MISSING',
    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS || 'MISSING'
  };

  res.status(200).json({ ok: true, path: req.url, envCheck, note: 'Minimal handler running' });
}
