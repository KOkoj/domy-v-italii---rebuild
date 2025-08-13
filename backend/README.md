# Backend – Italian Real Estate API

Express + TypeScript + Prisma (PostgreSQL). Swagger served at `/api/docs`.

## Quick Start

```bash
cp env.example .env
npm i
npm run db:push
npm run db:seed
npm run dev
```

- Health checks: `GET /health`, `GET /api/health`
- Swagger: `GET /api/docs`

## Deployment

- **Production Deployment**: See [DEPLOYMENT.md](./DEPLOYMENT.md) for Vercel deployment guide
- **Environment Variables**: See [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md) for production setup

## Auth

- `POST /api/auth/login` `{ email, password }` → `{ user, token, refreshToken }`
- `GET /api/auth/me` (Bearer)
- `POST /api/auth/refresh` `{ refreshToken }` → `{ token }`
- `POST /api/auth/logout` (stateless)

## Response Shape

- Success: `{ success: true, data, message? }`
- Error: `{ success: false, message, error? }`

## Scripts

- `npm run db:push` – Sync schema
- `npm run db:seed` – Create admin user
- `npm run dev` – Start dev server (Nodemon)
- `npm run build && npm start` – Production
- `npm test` – Integration tests (requires DB)

## Env

See `env.example` for all variables, including:
`DATABASE_URL`, `ALLOWED_ORIGINS`, `JWT_SECRET`, `REFRESH_TOKEN_SECRET`, `CLOUDINARY_*`, rate limiting, and admin seed creds.
