# BearVault

BearVault is a modern household finance web application with Clerk authentication, household-scoped Supabase persistence, and Twelve Data market pricing.

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The root route redirects to the dashboard.

## Verification

```bash
npm run lint
npm run build
```

## Technology

- Next.js App Router, React, and TypeScript
- React Compiler and ESLint
- Mantine and Tabler Icons
- Recharts for dashboard and cash-flow visualizations
- CSS Modules and global CSS; no Tailwind CSS
- Clerk Organizations as the household identity boundary
- Supabase Postgres with row-level security for household financial records
- Twelve Data for live and historical market information

## Supabase setup

1. Activate Clerk's native Supabase integration in Clerk.
2. Add Clerk as a third-party authentication provider in Supabase using the Clerk domain.
3. Apply `supabase/migrations/20260811000100_create_household_finance_schema.sql` with the Supabase CLI or SQL Editor.
4. Confirm `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` are set locally and in Vercel.

Do not configure a deprecated Clerk JWT template or add Supabase Auth UI. BearVault passes the current Clerk session token through Supabase's `accessToken` callback.
