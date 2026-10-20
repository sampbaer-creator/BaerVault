# Development

## Prerequisites

- Node.js and npm compatible with the versions in `package-lock.json` (use `npm ci` for a reproducible install).
- A Clerk application with Organizations enabled and a Supabase project for authenticated household features.
- Supabase CLI access or access to the Supabase SQL editor to apply migrations.
- Plaid Sandbox credentials for bank connection development. Twelve Data and OpenAI credentials are optional for their respective features.

The public landing page and `/demo` use synthetic data and do not require a household account. Protected routes require a signed-in Clerk user with an active organization.

## Environment

Copy `.env.example` to `.env.local` and fill in credentials for the services you intend to run. Keep `.env.local` and all real credentials out of git. The template contains:

| Service | Variables | Purpose |
| --- | --- | --- |
| Clerk | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` | Sign-in and household organizations |
| Supabase | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | Household records and server-side operations |
| Plaid | `PLAID_CLIENT_ID`, `PLAID_SECRET`, `PLAID_ENV`, `PLAID_WEBHOOK_URL` | Bank Link and synchronization; start with `PLAID_ENV=sandbox` |
| Bank-token encryption | `BANK_TOKEN_ENCRYPTION_KEY` | Base64-encoded 32-byte key for stored Plaid tokens; generate with `openssl rand -base64 32` |
| Budget advice | `OPENAI_API_KEY` | Optional AI budget advice |

`TWELVE_DATA_API_KEY` is additionally read by the market-data route when market prices are needed. Configure Clerk's Supabase integration or the `supabase` JWT template so Supabase receives the active organization claim; row-level security depends on that verified identity. Do not put service-role or other secret keys in `NEXT_PUBLIC_` variables.

## Run locally

```bash
npm ci
npm run dev
```

Open `http://localhost:3000`. The dev command binds to `0.0.0.0` for testing from another device on the same network. The public demo is at `/demo`.

Useful checks:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

`npm test` runs finance and budget-advice unit tests plus PGlite-backed database tests. It does not require a live Supabase project.

## Database migrations

Apply the SQL files in `supabase/migrations/` in timestamp order to the Supabase project used for development. With a linked Supabase CLI project, run `supabase db push`; alternatively apply each unapplied migration through the Supabase SQL editor. Keep deployed migrations immutable: add a new file for any schema or RLS change. Database tests exercise migrations locally with PGlite.

Supabase row-level security isolates records by household. Clerk Organizations identify the active household, and the server Supabase client passes the Clerk token to Supabase. The Plaid webhook and bank sync also use server-side credentials; they are not part of the public demo.

## Project structure and working rules

```text
app/          App Router pages, layouts, API routes, and global style tokens
features/     Product workspaces and their CSS Modules
components/   Shared UI, authenticated/demo shells, and providers
lib/          Domain helpers, Supabase repositories, service clients, and demo data
supabase/     Ordered database and RLS migrations
tests/        Unit and PGlite database tests
public/       Runtime static assets
```

Routes load initial data and pass it into feature workspaces. Authenticated reads and writes go through `lib/data/`; `/demo` uses synthetic data from `lib/demo/` and must not write production records. Keep route files thin, shared UI in `components/`, and feature-specific styling in CSS Modules with Mantine components. Budget is the primary purchase-entry workflow; Transactions is the unified ledger for income and expenses. Financial amounts should use the existing formatting helpers and tabular numerals. Preserve keyboard access, visible focus, theme support, and reduced-motion behavior.

The installed Next.js version has its own guides in `node_modules/next/dist/docs/`; read the relevant guide before changing Next-specific code.
