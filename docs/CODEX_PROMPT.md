# BaerVault — Redesign Prompt for Codex (final)

You are a senior product engineer and UI/UX designer working in the BaerVault repo. Make BaerVault feel like a premium, calm household finance app on the level of Copilot Money and Monarch, following the three reference mockups described in section 4. Keep everything that already works working.

Read this whole prompt first. Then read `AGENTS.md`, `docs/DEVELOPMENT.md`, `docs/REDESIGN_PLAN.md`, and `docs/UI_AUDIT.md`. **Where this prompt conflicts with those docs, this prompt wins.**

The three reference images are saved in `docs/design-references/` (`add-purchase-sheet.png`, `budgets-list.png`, `home-and-breakdown.png`). Open and study them before building UI. Match their **layout, hierarchy, spacing, and interaction patterns**, using BaerVault's colors and components. Do not copy any assets or text from them.

---

## 1. Permissions and working style

**You may use this computer:** run terminal commands, install the npm packages this prompt allows, start the dev server, run tests and builds, use git (branch, commit, push your branches), and open the app in a browser to check pages load, interactions work, and the console is clean.

**Limits:** stay inside this repo. Do not touch `.env*` (except `.env.example`) or secrets. Do not delete files this prompt doesn't name; list candidates in your report. Do not merge into `main` and do not force-push.

**No screenshots.** Never take screenshots while working or in reports. This overrides any screenshot instructions in other docs. Verify by reading code, running the app, checking the console, and running tests. Report in words.

**Work in stages.** Do one Stage (section 6) at a time on its own branch from an up-to-date `main`. When a Stage is done, stop and report (section 8). Wait for me to say "continue".

**When unsure, stop and ask.** If something conflicts with how the code works, or a task needs something the rules forbid, explain and wait. Don't guess or work around rules.

---

## 2. Product context

- **BaerVault** is a shared budget and finance app for a household (a Clerk Organization). Members share budgets, transactions, accounts, investments, and goals. Its edge over Copilot and Monarch: built for two or more people managing money together.
- **Every screen answers:** "Are we okay this month?"
- **Primary workflow:** logging a purchase into a monthly budget category (budget entries are the spending ledger). Income is logged in Transactions. Plaid-synced bank transactions land in a review queue.
- **Daily loop target (under 30 seconds):** open app → "$X left, N days left" → review new transactions → tap **+** to log anything missed → close.
- **Feel:** calm, clear, trustworthy, premium. Premium comes from **consistency and hierarchy, not effects**. No busy dashboards, no trading-terminal energy. Refine the existing product; do not start over.

**Information architecture — every number answers one question, and lives where that question is asked:**

| User question | Primary place | Key figure |
|---|---|---|
| Can we afford to spend more this month? | Home, Budget | Left to spend |
| Where has our money gone? | Transactions, Cash flow | Spent / net cash flow |
| How much money do we have? | Accounts | Account balances, net worth |
| Are we building wealth? | Investments, Goals | Portfolio value, goal progress |

Home answers the first question immediately and gives compact access to the other three. Every summary figure has a plain label that says what it measures ("Left to spend in October", not "$1,103.15 remaining"), so totals on different screens never look contradictory.

---

## 3. Hard rules (every stage)

**Stack (do not change):** Next.js 16 App Router, React 19, TypeScript, React Compiler, Mantine 9, Tabler Icons, Recharts, `motion`, CSS Modules, Clerk, Supabase (Postgres + RLS), Plaid, Twelve Data.

**Next.js warning:** this version has breaking changes. Before writing routing, redirects, layouts, metadata, fonts, or server-action code, read the relevant guide in `node_modules/next/dist/docs/`.

1. **Data layer off-limits** unless a task explicitly allows it: schema, migrations, RLS, `lib/data/*` query logic, `lib/banking/*`, Clerk config, market-data API. If a task needs a change there, STOP and propose the exact change (with RLS and a database test).
2. **Reuse existing server actions**, never duplicate data logic: `features/budgets/actions.ts` (`saveBudgetEntryAction` = add purchase, `addCategoryAction`, `updateBudgetCategoryAction`, `deleteBudgetEntryAction`, …), `features/transactions/actions.ts` (`saveIncomeAction`, `deleteIncomeAction`), `features/transactions/reviewActions.ts`, `features/accounts/actions.ts` (`transferFundsAction`, bank connection actions), `features/goals/actions.ts`, `features/investments/actions.ts`, `lib/data/recurring.ts` (`getUpcomingPayments`).
3. **Demo parity:** every UI change in `app/(app)/*` is also made in `app/demo/*` (synthetic data from `lib/demo/*`; never calls Supabase, Clerk org data, or Plaid).
4. **Styling:** Mantine + CSS Modules + tokens. No Tailwind classes in components. No new UI libraries (no shadcn, Radix, vaul, Headless UI, Chakra, MUI). Official `@mantine/*` packages allowed if needed; list any you add.
5. **Tokens only:** no hardcoded colors, font sizes, radii, shadows, or spacing in components.
6. **Themes:** light is the primary theme; dark must be equally polished; system must work.
7. **Money:** one shared formatter and a `Money` component everywhere. Tabular numerals. Minus sign for negatives.
8. **Accessibility (WCAG 2.2 AA):** visible focus, full keyboard access, `aria-label` on icon-only buttons, 44×44px touch targets, 4.5:1 text contrast in both themes (including muted labels and chart labels), status never shown by color alone, layouts survive 200% text scaling.
   **Component specs:** screen side padding 16–20px, card padding 16px, card radius 16px, button height 48px, input height 48–52px, section spacing 24px, primary financial value 28–34px (hero up to 40px), body 14–16px, secondary labels 12–14px. Card variants: `compact` and `regular` only.
9. **Motion:** only for sheets opening/closing, toasts, chip selection, and number count-up. 150–250ms. Respect `prefers-reduced-motion`.
10. **Responsive:** check 360, 390, 768, 1280px+. No horizontal page scroll. Nothing hidden behind the header or bottom bar.
11. **Copy:** short and friendly. "Purchase", never "expense". Member first names, never "User"/"Spouse". Dates "Today", "Yesterday", "Oct 14"; never ISO.
12. **Third-party code:** Mantine UI (`mantinedev/ui.mantine.dev`, MIT) may be copied and adapted with a credit comment `// Adapted from Mantine UI (MIT) — https://ui.mantine.dev`. The reference images and `sai-zack-dev/finance-app-ui` are visual reference only; copy no code or assets. Never commit third-party fonts or design-kit files.
13. **Quality gate (end of every stage):** `npm run typecheck`, `npm run lint`, `npm test`, `npm run build` all pass; no new browser console errors on touched pages; unit tests for every new calculation or helper.
14. **Commits:** small and descriptive. One branch per stage.

---

## 4. Design direction

### 4.1 Visual system
- **Palette (replace the current teal):**
  - Primary `#205B4D` · Soft green `#EAF3EF` · Background `#F7F8F6` · Surface `#FFFFFF` · Text `#1C2925` · Muted text (choose a gray that passes 4.5:1 on white) · Warning/over-budget `#D96B57` · Amber for "getting close" (choose one that passes contrast with text).
  - Build a 10-step scale for primary and neutrals in `app/styles/tokens.css`, register primary as the Mantine primary color, and define matching dark-mode values. Remove leftover blue, lime, navy, and rainbow colors.
  - Category colors: one muted, ordered palette (6–8 tints). Never rainbow. Coral is reserved for over-budget and losses.
- **Spacing:** 8-point system: 8 / 16 / 24 / 32 / 48 (keep 4 for tight gaps). Card padding 16–24, section gaps 24–32.
- **Type:** Inter via `next/font/google`. One large hero figure per screen. Money figures bold with tabular numerals. Labels small and muted.
- **Shape:** cards 16px radius, sheets 24px top radius, chips and pills fully rounded. Depth from card-vs-background contrast plus a very soft shadow; minimal borders.
- **Effects:** no glass except an optional subtle one on the bottom bar; no gradients except a subtle one on the Home hero. No decorative animation.

### 4.2 Reference 1 — Add purchase sheet (`add-purchase-sheet.png`)
One shared form pattern for **every** create/edit screen.
- **Title field:** large, borderless text input at the top ("What did you buy?") acting as the sheet title; small × close button on the right. When opened from a category, focus the amount instead.
- **Fields as underlined rows** (no boxed inputs, 48px tall, 16px font so iOS doesn't zoom):
  - `$ Amount` — `MoneyInput`, `inputMode="decimal"`.
  - `Date` — shows the date; right-aligned green "Today" link, plus "Yesterday".
  - `Paid from` — account picker, defaults to the last used account.
- **Category:** label "Category" with "1 selected" right-aligned; wrapping chips (emoji + name) for this month's categories, recently used first. Selected chip = filled dark (`#1C2925`) with white text. Last chip is a round green **+** that creates a category inline (`addCategoryAction`) and selects it.
- **Primary button:** full width at the bottom, muted/disabled until amount and category are valid, then primary green. Sticky above the keyboard and safe area.
- **Sheet:** drag handle, 24px top radius, height fits content (max 90vh), shrinks when the keyboard closes.
- **After save:** close, toast "Purchase added · Undo" (Undo = `deleteBudgetEntryAction`), refresh views.
- **One editing context at a time.** Never stack a sheet or form inside another sheet. "Add purchase" from a category opens the purchase sheet; on save or cancel, return to the category with scroll position preserved and a brief toast. On mobile, the category editor (budget, purchases, rename, delete) is a full-screen view with a back button rather than a sheet.
- **Editable fields must look editable:** clear underline or border, visible focus state; never pale fills that resemble disabled inputs.
- **Apply the same layout** to: edit purchase, add/edit income (title = income source; owner chips = member names instead of categories), transfer (from/to account chips), add/edit goal, add/edit category, add account. Delete actions sit at the very bottom as a coral text button with a confirm dialog.

### 4.3 Reference 2 — Budgets list (`budgets-list.png`)
For the Budget page (categories view) and the Home budget section.
- **One compact card per category:** emoji + name top-left, "$83 / $200" muted below; right side large "$117" with "remaining" below, or coral "$971" with "overspent".
- **Full-width progress bar** colored by status:
  - under 80% used → primary green, label "On track"
  - 80–100% → amber, "Getting close"
  - over 100% → coral, "Over by $X" (bar full)
  - status also shown in text, never color alone.
- **Pace marker:** a thin vertical tick on each bar at *(days elapsed ÷ days in month)* of the budget, for the current month only (hidden for past/future months). If spending is ahead of the tick, add a small amber line "Spending faster than usual". Put pace math in `lib/helpers/budgetPace.ts` with unit tests (first day, mid-month, last day, 28/29/30/31-day months, timezone at month boundaries).
- **Order:** over-budget first, then by % used descending. Option to switch to "My order".
- **Header:** page title "Budget" left, month switcher (← October 2026 →) and a small "+" (add category) right. Summary above the list: "$1,103 left of $2,245 · 11 days left" with one overall bar and pace marker.
- Tap a card → category sheet (same pattern as 4.2) showing budget, spent, remaining, and its purchases.

### 4.4 Reference 3 — Home and Breakdown (`home-and-breakdown.png`)
**Home**
- **Header:** compact, primary-green background with a subtle gradient only here. Left: member avatar(s) with household switcher. Right: notifications/review bell with a count badge. No centered wordmark.
- **Hero card** (white, overlapping the header bottom): label "Left to spend in October", one large centered number, change pill below ("+$240 · +12% vs last month" green, or coral when worse), "11 days left". Under it, three small stats: Spent · Planned · Income.
- **Range chips** under any chart: 1W · 1M · 3M · YTD · 1Y; selected chip = soft-green filled pill.
- **Sections (in order):** Budgets (top 4 compact cards from 4.3 + "See all") → To review (only if > 0) → Upcoming bills (next 3) → Latest transactions (5 rows) → Goals (top 1–2) → Net worth (one compact line).
- **Transaction rows:** 40px round tinted icon (category emoji or merchant initial), bold name, muted date below ("Aug 5"), amount right-aligned; income shown with "+" in green.

**Breakdown (Cash flow → Spending view)**
- Card with a **donut** of spending by category, total in the center ("$684" / "spent this month"), muted category palette, thin segment gaps.
- List below: round tinted icon, category name, % of total under the name, amount right-aligned; "See more" full-width soft button.
- Similar Income view (by source) and Budget view (planned vs spent).

**Navigation**
- Bottom bar: Home · Transactions · [raised **+**] · Budget · Accounts. Icons with small labels, active = primary green.
- The **+** is the universal quick-add: opens a small floating pill above the bar with three actions (Purchase · Income · Transfer), like the ↑ + ⇄ pill in the reference; tapping one opens its sheet. Long-press or tap again = Purchase directly. On Accounts/Investments/Goals tabs, the pill's actions are Add account / Add holding / Add goal plus Purchase.
- **Remove every other floating action button** in the app.
- **In-page views** (Budget: Categories · Cash flow; Cash flow: Spending · Budget · Income; Accounts: Accounts · Investments · Goals): a segmented pill at the top of the page content, URL-driven (`?view=`), back button works.
- **Headers on non-Home pages:** compact (≈56px), page title left-aligned, avatar right, solid surface (no fade band).

---

## 5. Known bugs and data checks (fix before anything else)
From `docs/UI_AUDIT.md`:
1. Home shows "0 days left" mid-month. Fix the calculation; add unit tests (mid-month, first/last day, past month = "Month ended", future month).
2. Category sheet: "Save category changes" overlaps the category title when scrolled.
3. Content hidden behind the bottom bar on every page. Add bottom padding = bar height + 24px + safe area.
4. Header fade band washes over content while scrolling. Replace with a solid surface + soft shadow.
5. Floating action buttons covering balances and charts (Accounts, Investments, Transactions, Budget, Goals). Remove them (see 4.4).
6. **Report only, don't auto-fix:** (a) Oct 14 income looks duplicated (e.g. "uvu +$755.86" and "UTAH VALLEY UNIV +$755.86"); report whether these are separate records and their sources. (b) Home net worth uses investments $47,772.49 while Investments shows $53,598.84; explain why and propose how to make them consistent or clearly labeled.

### 5.1 Financial trust checks (verify; report findings before changing logic)
For each item, report pass / fail / unclear with the file and function responsible. Fix display-only issues; for anything that changes calculations or data, propose the fix and wait.
1. Transfers between accounts never count as income or spending (Home, Budget, Cash flow, Transactions totals).
2. Net worth never double-counts investment accounts or connected investment balances.
3. Pending transactions are visually distinct from posted ones (label "Pending"), and their handling in totals is consistent.
4. Editing or deleting income/purchases updates every summary that uses it (Home, Budget, Cash flow, Transactions).
5. Budget progress uses only the selected month, never mixed periods.
6. Synced accounts show "Last updated …"; if a sync failed or data is older than 24h, show "Needs attention" instead of presenting stale balances as current.
7. Manually entered accounts/balances are labeled "Manual" and distinguishable from connected ones.
8. Each entry shows which household member it belongs to.

**Status vocabulary (use these exact words everywhere a number's state matters):** Recorded · Pending · Estimated · Last updated · Needs attention. Projected or forecast values (e.g. cash-flow forecasts) are always labeled "Estimated" and drawn differently (dashed/lighter) with a legend.

---

## 6. Stages

**Before Stage 1:** a short written audit: which `UI_AUDIT.md` items are done / partly / not done; duplicate components (e.g. `SectionTabs` vs `SegmentedTabs`); remaining hardcoded values. Report and wait.

### Stage 1 — Bugs and foundation · `fix/foundation`
- All of section 5, including the 5.1 trust-check report (findings first, then display-only fixes).
- New palette, spacing, type, and shape tokens (4.1) in `tokens.css` and the Mantine theme; light + dark. Update existing components to use them.
- `Money` component and shared formatter used everywhere.
- Merge duplicate tab components into one URL-driven `SegmentedTabs`.

### Stage 2 — One form pattern · `feat/form-pattern`
- Build the shared sheet form from 4.2 (`BottomSheet` + `FormSheetLayout` + `UnderlineField` + `MoneyInput` + `CategoryChips` + `StickyActions`).
- Migrate every create/edit screen to it: purchase, income, transfer, goal, category, account, holding.
- Universal **+** with the floating action pill (4.4); remove all other floating buttons.
- Tests for recently-used ordering and default-account logic.

### Stage 3 — Budget · `feat/budget-cards`
- Budget list, status logic, pace marker, sorting, header, summary (4.3).
- Category sheet in the 4.2 pattern.
- Tests for status thresholds and pace math.

### Stage 4 — Home · `feat/home`
- Header, hero card with change pill and stats, sections in order, transaction rows (4.4).
- Empty states with one clear action each.

### Stage 5 — Transactions · `feat/transactions-density`
- One-line scrollable filter row (Date · Category · Account · Member · Type) with a search icon that expands.
- Compact summary strip: "In +$4,698.94 · Out −$1,141.85 · Net +$3,557.09".
- Sticky date headers ("Today", "Yesterday", "Wed, Oct 14") with daily total; rows per 4.4 (name, category, member avatar, amount).
- "To review (N)" section at top: tap ✓ or swipe right = reviewed; swipe left = change category; "Mark all reviewed". Count on the nav badge and Home bell. Empty state "All caught up".
- Display-only name cleanup (title case, "UTAH VALLEY UNIV" → "Utah Valley Univ") with unit tests; stored data unchanged.

### Stage 6 — Cash flow and charts · `feat/breakdown`
- Breakdown donut and list (4.4), Spending · Budget · Income views.
- Cash-flow chart: grouped bars Income vs Spend per month with month labels, legend, and range chips. Remove the unexplained dashed lines.

### Stage 7 — Accounts, Investments, Goals · `feat/wealth-tabs`
- Accounts: net worth hero + change pill + compact chart with range chips; accounts grouped by type ("Checking · $1,205.34"); bank connection shown as a small row per institution ("Capital One · Synced Oct 20 · refresh"); Disconnect in an overflow menu with confirm.
- Investments: primary palette only; holdings as compact rows (ticker badge, full name, value, gain since purchase "+$1,240 (5.9%)"); replace "top movers today" with holdings sorted by value; allocation as a donut with legend.
- Goals: compact cards like 4.3 (name, target date, bar, "$2,500 of $10,000 · 25%", nudge "Save $214/mo to reach it by Dec 2026"; unit-test the math).

### Stage 8 — Polish · `polish/final`
- Skeleton loaders shaped like real cards on each main route.
- Toasts after every save with Undo where possible.
- Full dark-mode pass on every screen.
- Check every screen at 360/390/768/1280px, keyboard-only, reduced motion, 200% text size, and with the on-screen keyboard open on forms.
- Stress-test with demo data: very long merchant and category names, very large balances ($12,345,678.90), negative net worth, zero accounts, zero budgets, zero transactions, and a brand-new household. Nothing may overflow, truncate key numbers, or overlap.
- Rename `package.json` `name` from `bearvault` to `baervault` (and check nothing depends on the old name).

---

## 7. Definition of done (each stage)
- All tasks done, or listed as skipped with the reason.
- Quality gate passes.
- Works in light, dark, system; at 360/390/768/1280px; keyboard only; reduced motion.
- `/demo` matches and works signed-out.
- No hardcoded values, no new UI libraries, no data-layer changes without approval.

## 8. Report (end of every stage, in words, no screenshots)
1. Branch and commits.
2. What changed, by screen.
3. Quality-gate results.
4. Skipped items, assumptions, uncertainties, and anything needing my decision (especially proposed schema changes).
5. A checklist of screens for me to check on my phone and desktop, light and dark.
6. Stop and wait for "continue".

---

**Start now:** open the three reference images, do the pre-Stage-1 audit, report, and wait.
