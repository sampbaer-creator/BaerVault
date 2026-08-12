# BearVault

BearVault is a household finance application for managing budgets, cash flow, and investments in one shared workspace. Clerk Organizations represent households, while Supabase stores financial records with PostgreSQL row-level security.

## What BearVault does

- Creates a shared financial workspace for a household
- Tracks monthly budgets, planned amounts, and individual spending entries
- Records household income and derives net cash flow and savings rate
- Manages investment accounts, holdings, and purchase lots
- Uses live and historical Twelve Data market information for portfolio calculations
- Keeps demo data separate from authenticated household data
- Gives members of the same Clerk Organization access to the same household records

## Application flow

```text
Public landing page
        ↓
Create account or sign in with Clerk
        ↓
Google authentication and MFA
        ↓
Create or join a household organization
        ↓
Household dashboard
```

## Public demo

Visitors can open `/demo` from the landing page without creating an account. The demo mirrors the dashboard, budget, cash-flow, investment, household, and settings navigation with interactive mock records stored only in the browser tab. It does not authenticate, call Supabase repositories, or write to production household tables.

Authenticated users without an active organization are sent to `/onboarding`. Protected application routes include `/dashboard`, `/budget`, `/cash-flow`, `/investments`, `/household`, and `/settings`.

## Architecture

| Service | Responsibility |
| --- | --- |
| Next.js | App Router application, Server Components, Server Actions, and API routes |
| Clerk | Authentication, Google login, MFA, users, and household organizations |
| Supabase | PostgreSQL persistence and household-isolated row-level security |
| Twelve Data | Current and historical stock and ETF market data |
| Vercel | Production hosting and Git-based deployments |

BearVault uses Clerk as its only authentication provider. Supabase clients receive the active Clerk session token through the supported `accessToken` callback; the application does not add a second Supabase Auth login.

## Data and security

The database migration creates:

- `households`
- `budget_months`
- `budget_categories`
- `budget_entries`
- `income_entries`
- `investment_accounts`
- `holdings`
- `purchase_lots`
- `portfolio_snapshots`

Every exposed financial table has row-level security enabled. Policies resolve the active Clerk organization from verified JWT claims and restrict records to the matching internal household. Client-provided household IDs are not used as authorization.

Market prices are intentionally not stored as the ownership source of truth. Supabase stores what the household owns; Twelve Data supplies what the market is doing.

## Local development

Requirements:

- Node.js and npm
- Clerk development instance
- Supabase project
- Twelve Data API key

Install and run:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Create a local `.env` or `.env.local` file containing these variable names:

```text
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
NEXT_PUBLIC_CLERK_SIGN_IN_URL
NEXT_PUBLIC_CLERK_SIGN_UP_URL
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
TWELVE_DATA_API_KEY
```

Never commit environment files or secret values.

## Supabase setup

1. Activate Clerk's current Supabase integration in Clerk.
2. Add Clerk under Supabase third-party authentication.
3. Apply [`supabase/migrations/20260811000100_create_household_finance_schema.sql`](supabase/migrations/20260811000100_create_household_finance_schema.sql) using the Supabase CLI or SQL Editor.
4. Add the Supabase publishable variables to the local and Vercel environments.
5. Test two users in one organization and a user in a different organization to verify sharing and isolation.

Do not configure Clerk's deprecated JWT-template integration and do not use a Supabase service-role key for normal household CRUD.

## Verification

```bash
npm run lint
npm run build
```

Production testing should cover new-household empty states, persistence after refresh and sign-in, shared spouse access, cross-household isolation, and Twelve Data price/history retrieval.

## Technology

- Next.js 16, React 19, and TypeScript
- Clerk Organizations and production authentication
- Supabase Postgres and row-level security
- Mantine and Tabler Icons
- Recharts
- CSS Modules
- Twelve Data API
- Vercel

## Production deployment

The production application is designed for `baervault.company`. A Clerk production instance requires a custom domain with verified DNS and deployed Clerk certificates; a `*.vercel.app` domain is suitable for previews but not the final Clerk production configuration.
