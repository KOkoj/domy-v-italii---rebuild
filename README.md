# Italian Real Estate – Monorepo

Monorepo for a production-ready Italian Real Estate platform:

- **Backend API**: Node.js, Express, TypeScript, Prisma (PostgreSQL on Railway)
- **Admin Dashboard**: React, Vite, TypeScript, Tailwind, TanStack Query, React Router (Netlify)
- **Static Website (optional)**: pure HTML/CSS/JS
- **Tooling**: ESLint, Prettier, Husky + lint-staged, Playwright/Jest/Vitest, Swagger, CI-ready

> **Status:** Batch 1–2 shipped (workspace + backend). Next batch will include full admin dashboard.

## Quick Start (Monorepo)

```bash
# Node 20 recommended
nvm use

# install root tooling
npm i
```

### Environments

- `backend/.env.example`
- `admin-dashboard/.env.example`

Copy to `.env` in each package before running them.

## Workspaces

- `backend/` – API server (Express/Prisma)
- `admin-dashboard/` – Admin SPA (React/Vite)
- `static-website/` – Optional marketing site
- `docs/` – Deployment & API docs (Swagger served by backend)

---

## Run & Deploy

Local run:
```bash
cd backend && cp env.example .env && npm i && npm run db:push && npm run dev
# in another terminal (after Batch 3 lands)
cd admin-dashboard && cp env.example .env && npm i && npm run dev
```

Deploy:
- **Railway (backend)** – Connect repo, add PostgreSQL, set envs, build & start.
- **Netlify (admin)** – Base: `admin-dashboard`, Build: `npm run build`, Publish: `admin-dashboard/dist`,
  set `VITE_API_URL=https://<railway-app>.railway.app/api`.
