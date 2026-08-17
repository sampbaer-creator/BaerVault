# BearVault architecture

## System overview

BearVault is a Next.js 16 App Router application built with React 19 and TypeScript. It has two presentation modes:

1. An authenticated household workspace backed by Supabase.
2. A public demo backed by static mock records and local React state.

The application is organized in one direction:

```text
route (app/) -> feature UI (features/) -> domain/repository (lib/) -> external service
```

Cross-feature UI lives in `components/`. Repositories never import React components.

## Frontend architecture

Server route files load initial data and pass serializable models into client workspaces. Interactive screens use client components for drawers, filtering, optimistic local state, charts, and preferences.

- Mantine supplies accessible drawers, modals, and provider infrastructure.
- Tabler supplies the icon family.
- Recharts renders financial charts.
- Motion powers the glass toggle interaction.
- CSS Modules own feature styles; `app/globals.css` owns global tokens and themes.

`components/layout/AppShell.tsx` renders authenticated navigation and page chrome. `components/demo/DemoShell.tsx` provides a visually similar public shell without production writes.

## Backend architecture

Next.js Server Actions under `app/(app)/*/actions.ts` validate mutation input, call a repository, and revalidate affected routes. Read operations occur in Server Components through `lib/data/*` repositories.

`app/api/market-data/route.ts` is the only HTTP API route. It validates requested symbols, calls Twelve Data, normalizes responses, and returns safe market values to authenticated UI.

## Database

Supabase Postgres stores households, budgets, income entries, financial accounts, investment accounts, holdings, purchase lots, portfolio snapshots, and savings goals. Ordered migrations live in `supabase/migrations/`.

Row-level-security policies isolate records by household. The database resolves the active Clerk organization from verified JWT claims; browser-provided household IDs are not trusted for authorization.

## Authentication and household resolution

Clerk is the only authentication provider. `proxy.ts` installs Clerk middleware. `app/(app)/layout.tsx` requires a signed-in user and active organization, redirecting users without an organization to onboarding.

`lib/data/households.ts` maps the active Clerk organization to an internal Supabase household. `lib/supabase/server.ts` creates a Supabase client whose access token comes from the active Clerk session.

## Major data flows

### Authenticated read

```text
request -> protected layout -> server page -> lib/data repository
        -> Clerk-token Supabase client -> RLS-filtered rows -> feature UI
```

### Authenticated mutation

```text
client form -> server action -> validation -> lib/data repository
            -> Supabase/RLS -> revalidatePath -> refreshed server data
```

### Public demo

```text
/demo route -> mock domain data -> shared feature or demo adapter
            -> local component/session state only
```

### Market prices

```text
investment/dashboard client -> /api/market-data -> Twelve Data
                            -> normalized prices -> rendered valuation
```

## External services

- Clerk: users, sessions, MFA, and household organizations.
- Supabase: PostgreSQL persistence and row-level security.
- Twelve Data: current and historical stock/ETF prices.
- Vercel: deployment target and environment configuration.

## Configuration

- `next.config.ts`: React Compiler and package-import optimization.
- `tsconfig.json`: strict TypeScript and the `@/*` root alias.
- `eslint.config.mjs`: Next.js Core Web Vitals and TypeScript linting.
- `postcss.config.mjs`: Tailwind/PostCSS processing used by generated UI styles.
- `components.json`: shadcn-compatible aliases and UI metadata.
- `app/layout.tsx`: metadata, font, providers, and preference bootstrap.

## Testing and verification

The repository currently has no automated unit, integration, or end-to-end tests. The supported checks are:

```bash
npm run typecheck
npm run lint
npm run build
```

High-value future tests are repository validation, finance calculations, server-action input handling, household isolation, and mobile navigation reachability.

## Architectural constraints

- Keep route files thin; business logic belongs in `lib/` and UI composition in `features/`.
- Keep demo mode free of protected mutations and production database calls.
- Preserve Clerk organization checks and Supabase RLS as layered authorization.
- Add schema changes as new migrations; never rewrite deployed migrations.
- Prefer extracting cohesive sections from oversized workspaces over introducing a broad state-management framework.

## Known technical debt

- `features/investments/InvestmentsWorkspace.tsx` and its CSS Module are the largest files in the repository. They should be split by cohesive screen section and form flow, but that refactor should be behavior-tested rather than combined with a folder move.
- Several older workspaces use densely compressed JSX or CSS. Formatting them is safe, but component extraction should happen feature by feature.
- The authenticated and demo shells intentionally differ, but their navigation definitions are duplicated. A future shared navigation model could remove drift while preserving distinct route prefixes.
- There is no automated test suite. Finance calculations, repository contracts, server-action validation, and navigation reachability are the best first targets.
- `idea/` and `Photos/` are historical design evidence at the repository root. They are documented and unused at runtime; moving binary references into `docs/assets/` can be handled separately without affecting application code.
- The `cloudy-cashflow` palette key remains for saved-preference compatibility even though its displayed name is “Cloudy Slate.” Renaming the persisted key requires a preference migration.
