<div align="center">
  <img src="app/icon.png" alt="BaerVault app icon" width="96" />

  # BaerVault

  **A calm, shared home for your household finances.**

  [![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=nextdotjs&logoColor=white)](https://nextjs.org/) [![React](https://img.shields.io/badge/React-19-149ECA?style=flat-square&logo=react&logoColor=white)](https://react.dev/) [![TypeScript](https://img.shields.io/badge/TypeScript-Ready-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/) [![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com/) [![Vercel](https://img.shields.io/badge/Deploys_on-Vercel-000000?style=flat-square&logo=vercel&logoColor=white)](https://vercel.com/)
</div>

## Screenshots

<!-- Add real BaerVault screenshots at these paths. -->

| Home | Budget | Transactions |
| --- | --- | --- |
| ![Home](docs/screenshots/home.png) | ![Budget](docs/screenshots/budget.png) | ![Transactions](docs/screenshots/transactions.png) |

**Live demo:** [Open BaerVault](https://YOUR_DEMO_URL)

## Features

- **Home:** monthly budget status, recent activity, upcoming payments, goals, and net worth.
- **Transactions:** household ledger, bank transaction review, and recurring payments.
- **Budget:** category plans, purchase entry, and cash flow.
- **Accounts:** connected accounts, investments, and savings goals.
- **Household:** member access, invitations, and spending by member.

## How it fits together

```mermaid
flowchart LR
    UI[Next.js app] --> AUTH[Clerk auth and Organizations]
    UI --> DATA[Supabase data layer]
    DATA --> DB[(PostgreSQL with RLS)]
    UI --> PLAID[Plaid bank sync]
    UI --> MARKET[Twelve Data market data]
```

The public demo uses synthetic data. Authenticated household records are scoped through Clerk Organizations and Supabase row-level security.

## Tech stack

| Area | Tools |
| --- | --- |
| App | Next.js 16, React 19, TypeScript |
| UI | Mantine, CSS Modules, Tabler Icons, Recharts |
| Identity | Clerk and Organizations |
| Data | Supabase PostgreSQL, row-level security |
| Finance integrations | Plaid, Twelve Data |
| Tests | Node test runner, PGlite |

## Quick start

```bash
git clone https://github.com/sampbaer-creator/BaerVault.git
cd BaerVault
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`. Configure the required service credentials in `.env.local`; the public demo is available at `/demo` without sign-in. See [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) for environment setup, migrations, and test commands.

## License

License: **Pending owner selection.** No license file is currently present.
