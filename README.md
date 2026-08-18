# BearVault

BearVault is a shared household-finance app for seeing the full financial picture in one calm workspace. It brings accounts, transactions, monthly budgets, cash flow, investments, savings goals, and household access together without turning personal finance into an accounting tool.

## What it includes

- A responsive dashboard for current net worth, spending, and recent activity
- Transaction, account, budget, cash-flow, investment, and goal workspaces
- Shared households through Clerk Organizations
- Supabase persistence with row-level security
- Live and historical market data through Twelve Data
- Light, dark, and system themes
- Mobile navigation and installable PWA support
- A public demo with clearly synthetic data

## Built with

Next.js App Router, React, TypeScript, Clerk, Supabase PostgreSQL, Mantine, Recharts, Tabler Icons, and Vercel.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The public landing page and demo work without an account. Protected household features require the environment variables for Clerk, Supabase, and Twelve Data.

Use `.env.local` for local secrets. Never commit credentials.

## Useful commands

```bash
npm run dev
npm run lint
npm run build
```

## Project structure

```text
app/          Routes, layouts, API handlers, and global styles
components/   Shared UI, navigation, branding, and preferences
features/     Finance workspace components and scoped styles
lib/          Data access, domain helpers, and mock demo data
supabase/     Database migrations
docs/         Architecture and project maps
```

More detail is available in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) and [docs/PROJECT_MAP.md](docs/PROJECT_MAP.md).

## Status

BearVault is under active development. The product currently supports its core household-finance workflows; direct bank connections, payments, email, and analytics are not yet integrated.

## Author

Built by [Samuel Baer](https://github.com/sampbaer-creator).
