# Task 2 frontend update

Frontend only. Nothing in `server/` or the database was changed.

## How to apply
1. Copy everything in this folder over your project (same relative paths).
2. Recommended: run `./cleanup-unused.sh`. It removes the old asset-management screens, which have type errors and sit in `src/pages` (a folder Next.js compiles).
3. `npm install` (the lockfile is updated), then `npm run dev` (Vite on :47190, API proxied to :47191).
4. Next.js: `npm run next:build && npm run next:start`.

## Pages
Dashboard, New sale (POS), Products, Low stock, Stock history, Sales (invoices), Reports (sales + profit, CSV export).

## Config
- Local dev needs no env vars (Vite proxies /api, Next rewrites /api).
- Deployed frontend: set `NEXT_PUBLIC_API_URL` (or `VITE_API_URL`) to the full backend origin, e.g. `https://my-api.example.com` (must start with http/https).
- Demo login shown on the sign-in page: `STR-MGR-01` / `admin123`.

## Tooling changes
- `@tailwindcss/postcss` + `postcss.config.mjs`: Next.js had no Tailwind processing, so it rendered unstyled.
- `vite.config.ts`: `/api` dev proxy.
