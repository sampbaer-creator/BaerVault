# BearVault project map

This is the shortest reliable map of the repository. BearVault is a Next.js household-finance application with a public demo and an authenticated workspace.

## Top-level structure

```text
app/            Next.js routes, layouts, API endpoints, and server actions
features/       Product-area UI and feature-specific view models
components/     Shared UI, application shells, providers, and demo infrastructure
lib/            Shared domain models, calculations, repositories, and service clients
supabase/       Ordered PostgreSQL migrations and row-level-security policies
types/          Ambient TypeScript declarations
docs/           Architecture and repository documentation
```

Generated or local-only folders such as `.next/`, `node_modules/`, and `.vercel/` are not application source.

## Routes and entry points

The root entry point is `app/layout.tsx`. It installs Clerk, Mantine, preferences, fonts, and mobile viewport behavior.

| URL | Route entry | Main feature |
| --- | --- | --- |
| `/` | `app/page.tsx` | Public landing page |
| `/dashboard` | `app/(app)/dashboard/page.tsx` | `features/dashboard/` |
| `/transactions` | `app/(app)/transactions/page.tsx` | `features/transactions/` |
| `/accounts` | `app/(app)/accounts/page.tsx` | `features/accounts/` |
| `/budget` | `app/(app)/budget/page.tsx` | `features/budget/` |
| `/investments` | `app/(app)/investments/page.tsx` | `features/investments/` |
| `/goals` | `app/(app)/goals/page.tsx` | `features/goals/` |
| `/household` | `app/(app)/household/page.tsx` | `features/household/` |
| `/settings` | `app/(app)/settings/page.tsx` | `features/settings/` |
| `/demo/*` | `app/demo/` | Shared features with mock data or demo-only adapters |
| `/api/market-data` | `app/api/market-data/route.ts` | Twelve Data proxy |

The `(app)` route group does not appear in URLs. Its layout enforces authentication and an active Clerk organization.

## Feature folders

Each folder under `features/` owns the main workspace component and its CSS Module. Dashboard also owns its view-model builder. Features may import shared UI from `components/` and shared logic from `lib/`; shared code must not import feature UI.

## Shared components

- `components/layout/`: authenticated application shell, desktop sidebar, mobile navigation, and page header.
- `components/demo/`: public-demo shell and demo-specific adapters.
- `components/preferences/`: global preference provider.
- `components/shared/`: reusable dialogs and browser runtimes.
- `components/ui/`: low-level reusable controls.
- `components/brand/`: BearVault brand components.

## Shared logic and services

- `lib/data/`: server-only Supabase repositories grouped by financial domain.
- `lib/supabase/`: Supabase configuration and the Clerk-token-aware server client.
- `lib/finance.ts`: budget and monetary calculations.
- `lib/accounts.ts`, `lib/goals.ts`, `lib/investmentData.ts`: domain types and helpers.
- `lib/mockFinanceData.ts`: safe public-demo records.
- `lib/themePalettes.ts`: preference palette definitions.

## Styling and assets

Global tokens and browser defaults live in `app/globals.css`. Page-specific styles use colocated CSS Modules. `DESIGN.md` documents the visual system. Runtime static assets should go in `public/`; generated icons live in the special `app/icon.tsx` and `app/apple-icon.tsx` routes.

## Where to make common changes

| Change | Start here |
| --- | --- |
| Add or rename a route | `app/` and `components/layout/navigation.ts` |
| Change a product screen | Matching folder in `features/` |
| Change navigation or shell behavior | `components/layout/` and `components/demo/DemoShell.tsx` |
| Change persistence | Matching repository in `lib/data/` |
| Change database schema or RLS | Add a migration in `supabase/migrations/` |
| Change theme behavior | `components/preferences/`, `features/settings/`, and `lib/themePalettes.ts` |
| Change global design tokens | `app/globals.css` and `DESIGN.md` |
| Change market-data behavior | `app/api/market-data/route.ts` |
