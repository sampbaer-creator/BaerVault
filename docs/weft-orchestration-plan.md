# Weft workflow and live budget forecasts

The Weft monthly review now lives in the **original BaerVault repository** under `workflows/weft/monthly-review/`. Its source of truth is this directory. The older standalone `baervault-workflows` repository is retained for history but is not the target for future feature development.

**Live today:** `features/budgets/budgetAdviceActions.ts` calls `lib/helpers/budgetForecast.ts` within the authenticated Next.js server. It calculates deterministic forecasts from read-only, household-scoped Supabase rows and sends no financial transactions to OpenAI. Budgets and existing ledger actuals only change through explicit user approval. Import-based estimates are kept separate and clearly labeled.

**Weft today:** The graph compiles and runs in local WSL on synthetic fixtures. Python performs category statistics, recurring and unusual transaction analysis, and a monthly forecast. Weft handles review approval, rejection, and run-scoped report storage.

**Not live yet:** The production Vercel website does not call the Weft runtime, and a local process on `127.0.0.1` cannot serve secure production users. Weft report output is not published to the Supabase household tables.

To deploy Weft as the production orchestrator, configure an always-available Weft service with authenticated, tenant-isolated task submission and delivery; signed callback or fetch access; per-household quotas and idempotency; strict schemas, payload limits and audit trail; privacy and retention policies; review approval bound to the original user and household; and a rollback path. Never send bank credentials or raw provider payloads into the workflow. Preserve the local Next.js forecast as a safe fallback until hosted orchestration has passed integration tests.

For now, deploy BaerVault's website normally using Vercel. The Weft folder is versioned together with the rest of the app, but it is not built into the Next.js deployment.
