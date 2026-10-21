# BaerVault UI/UX Audit — Mobile (Oct 21, 2026)

> **For Codex:** Save as `docs/UI_AUDIT.md`. Work through it in the order of the "Fix order" section at the bottom, one batch per branch. Every fix must also be applied to the matching `/demo` page. Follow all hard rules in `docs/REDESIGN_PLAN.md` (no schema changes without asking, reuse server actions, Mantine + CSS Modules only, light/dark support, WCAG AA). After each batch: typecheck, lint, test, build, then stop and report.
>
> Severity: **P0** = broken / blocks use · **P1** = confusing or looks unfinished · **P2** = polish that makes it feel premium.

Screenshot key (taken at ~400px width):
| # | File | Screen |
|---|---|---|
| 1–4 | 082959 → 083011 | Home (top → bottom) |
| 5 | 083014 | Transactions |
| 6 | 083019 | Edit income sheet |
| 7 | 083035 | Budget |
| 8 | 083039 | Category sheet |
| 9 | 083044 | Category sheet → Add purchase |
| 10–12 | 083110 → 083119 | Budget → Cash flow |
| 13 | 083123 | Accounts |
| 14–16 | 083133 → 083141 | Accounts → Investments |
| 17 | 083147 | Accounts → Goals |
| 18 | 083150 | Add goal sheet |

---

## Overall verdict

The new structure is working: five tabs, raised **+**, tabbed pages, teal palette, budget-first Home. The problems now are **layering bugs, too many competing buttons, duplicated information, raw data showing through, and off-palette colors**. Fixing the P0 and P1 items below will move it from "nice template" to "premium product."

---

## 1. Global issues (fix once, fixes every screen)

### 1.1 P0 — Floating action buttons pile up and cover content
- **Accounts / Investments (#13–16):** three floating buttons ("Connect bank", "Transfer", "Add account") stack on the right and cover balances (Baer Checking's `$1,205.34`, Savings `$15,162.11`), the time-range chips, and holdings cards. They also crowd the center **+**.
- **Transactions (#5):** a floating "Add income" pill on top of the center **+** and the inline "Add income / Add expense" buttons. Three ways to do the same thing.
- **Budget (#7):** floating "Add category" plus an inline "Add category" button, and the floating one covers the Coffee row.
- **Goals (#17):** floating "Add goal".

**Fix**
- Remove ALL page-level floating buttons. The center **+** is the only floating action in the app.
- The **+** sheet is context-aware: it opens on the most likely action for the current tab, with the other actions one tap away:
  - Home, Budget, Transactions → **Add purchase** (tabs inside sheet: Purchase · Income · Transfer)
  - Accounts tab → **Add account** (options: Add account · Connect bank · Transfer)
  - Investments tab → **Add holding**
  - Goals tab → **Add goal**
- Page-specific secondary actions go in the page header as one small text/icon button (e.g. "Add category" next to the month switcher), never floating.

### 1.2 P0 — Content hidden behind the bottom bar
Last items are cut off behind the nav on every page: "Mahjong" row (#2), Net worth figure (#3), Coffee row (#7), "Spend $1,141.85" (#10), last holding (#16).

**Fix:** In `AppShell`, give the scroll container `padding-bottom: calc(var(--bottom-nav-height) + var(--space-6) + env(safe-area-inset-bottom))`. Define `--bottom-nav-height` once and use it in both places.

### 1.3 P0 — Header fade band muddies content while scrolling
On #2, #3, #4, #11, #12, #16 a tall teal-to-white gradient under the header washes over cards as they scroll under it. Text becomes low-contrast ("$215.00 over / $349.03 left" in #2, "Income / Spend" in #11), and it looks like a rendering glitch.

**Fix:** Remove the gradient fade. When scrolled, the header becomes a solid surface (or the glass surface from Plan §1.6) with a 1px bottom border or `--shadow-1`. Nothing translucent sits over money figures.

### 1.4 P1 — Header wastes space and doesn't say where you are
The header is a centered "BaerVault" logo with a generic profile icon on every page. Users can't tell which page they're on except from the bottom bar.

**Fix**
- Home: header shows greeting + avatar (see §2).
- Every other tab: left-aligned **page title** ("Transactions", "Budget", "Accounts") in `--text-h1`, avatar on the right. Logo appears only on Home or not at all.
- Replace the generic person icon with the user's Clerk avatar (initials fallback).
- Header height ~56px, not ~64px with heavy gradient.

### 1.5 P1 — Bottom bar polish
- Labels are ~10px and hard to read; use 11–12px, weight 500.
- Active state is a pale pill that's barely visible on the light background. Use teal icon + teal label, and a slightly darker pill.
- The **+** overlaps the bar's top edge unevenly; center it vertically on the bar's top edge, 56px diameter, `--shadow-2`.

### 1.6 P1 — Placeholders look like real data
"Costco" (#9) and "Emergency fund" (#18) are dark enough to look already filled in. Fields prefilled with `0` (#18 Already saved, Monthly contribution) look like values.

**Fix:** Placeholder color `--text-muted` at ~50% contrast, prefix with "e.g." ("e.g. Costco"). Number fields start empty, not `0`.

### 1.7 P1 — Raw data shown to users
- ISO dates "2026-10-14" (#2). Use "Oct 14" (or "Today" / "Yesterday").
- Owner labels "User", "Spouse", "Household" (#2, #5, #6). Show the member's first name + small avatar; "Shared" instead of "Household".
- Merchant/source names in mixed case and duplicates: "uvu", "UVU", "UTAH VALLEY UNIV" (#2, #5, #12). Display title case ("Utah Valley Univ") via a display-only formatter; do not change stored data.

### 1.8 P1 — Possible duplicate income (investigate, don't auto-fix)
Oct 14 shows `uvu +$755.86` and `UTAH VALLEY UNIV +$755.86`, plus `UVU +$625.97` and `UTAH VALLEY UNIV +$625.97`. Looks like the same paychecks entered manually AND synced from Plaid, which would double income ($4,698.94) and make the budget look healthier than it is.

**Codex:** report whether these are separate records and their sources. Propose a "possible duplicate" flag in the review queue. Do not delete data.

### 1.9 P1 — Off-palette colors
- Royal blue "Add holding" button and Fidelity icon circle (#14, #15), blue goal ring (#17), lime-green investment chart (#14), navy amount text on holdings (#16), rainbow category dots (#11, #12).

**Fix:** Primary actions = teal only. Charts use the 5 chart tokens. Category colors come from one muted, ordered palette, and red is reserved for "over budget" / losses (Groceries in red in #11 reads as a warning when it isn't).

### 1.10 P1 — Sheets (modals) feel heavy
#6, #8, #9, #18: oversized circular close button with thick border, dimmed logo visible behind, sheet fills the whole screen with empty space below, Save button not anchored.

**Fix (`BottomSheet`)**
- Drag handle at top, title left, small 32px ghost "×" button right.
- Sheet height fits content (max 90vh), rounded top 24px.
- Primary button sticky at the bottom of the sheet with safe-area padding.
- Destructive actions (Delete) at the very bottom as a text button, with `ConfirmDialog`.

### 1.11 P2 — Native inputs look inconsistent
Native date pickers (mm/dd/yyyy, calendar glyph) and native selects (#6, #9, #18) clash with the custom inputs, and the "Select an account" select uses a smaller font (#9).

**Fix:** Use Mantine `DateInput`/`Select` styled with tokens, or keep native but wrap them to match height (48px), font size (16px, also prevents iOS zoom), radius, and border. Add date quick chips "Today / Yesterday".

### 1.12 P2 — Uneven card spacing
Large dead zones inside cards: "This month" (#3) gap between title and "October 2026", "Current position" (#3/#4), Accounts chart card empty bottom (#13), Goals gap between summary and "Active" (#17).

**Fix:** Standard card: padding `--space-5`, header-to-content gap `--space-4`, section gap `--space-6`. Remove fixed heights on cards and charts.

### 1.13 P2 — Alignment inconsistency
Cash flow cards are center-aligned (#10, #12), everything else is left-aligned. Pick left-aligned everywhere except a single hero number.

---

## 2. Home (#1–4)

| Sev | Issue | Fix |
|---|---|---|
| **P0** | "**0 days left**" on Oct 21. Should be 10 (or 11 inclusive). | Fix the days-left calculation in `dashboardViewModel.ts` (likely timezone or comparing selected month end incorrectly). Add unit tests: mid-month, last day, first day, past month ("Month ended"), future month. |
| P1 | Status says "On track" while Shopping is $215 over. | Status should reflect worst case: "On track · 1 category over". Tap opens Budget. |
| P1 | "Good to see you" is generic. | "Good morning, Sam" (time-of-day + first name). Move into header. |
| P1 | "$1,103.15 remaining" appears twice (hero + "This month" card #3/#4). | Delete the "This month" card. Move its Spent / Planned / Income row into the hero as three small stats below the big number. |
| P1 | Budget by category shows 2 cramped columns; "Christmas" is cut off with a stray gray scroll dash; "$365.00 of $150.00" is hard to parse. | Horizontal scroll of `ProgressRing` tiles (emoji center, "$215 over" / "$349 left" below), most-at-risk first. First tile is dashed "+ Add purchase". Hide scrollbar; show a partial next tile as the scroll cue. |
| P1 | Upcoming payments: long explanatory empty-state paragraph. | One line: "No upcoming bills yet" + button "Add a recurring bill". Hide the card entirely after the user dismisses it. |
| P1 | Recent activity: every row has the same generic wallet icon. | Category emoji or merchant initial in a tinted circle; income gets a ↓ teal icon. |
| P2 | Net worth is huge on Home and duplicated on Accounts; the "Some prices are unavailable…" sentence and formula line add noise. | Compact single-line card at the bottom: "Net worth $63,327 →". Move the price warning to an ⓘ tooltip on Accounts. |
| P2 | Quick action tiles are large and low contrast on the gradient. | Smaller glass tiles (icon + label), keep three: Add purchase, Add income, Transfer. |
| **Data** | Net worth uses investments **$47,772.49** but Investments shows portfolio **$53,598.84** (#4 vs #14). | Report why (cost basis vs market price?). Both screens must use the same number, or label clearly ("at purchase cost"). |

**Target Home order:** Greeting header → Left-to-spend hero (big number, days left, status, Spent/Planned/Income) → Quick actions → Budget rings → Needs review (when > 0) → Upcoming bills → Recent activity (5) → Goals → Net worth line.

---

## 3. Transactions (#5) and Edit income (#6)

| Sev | Issue | Fix |
|---|---|---|
| **P0** | Floating "Add income" overlaps rows and the **+**. | Remove (see §1.1). |
| P1 | "Add income / Add expense" buttons and "All / Income / Expenses" filter chips look identical. Users can't tell actions from filters. | Remove the two action buttons (the **+** handles it). Keep filters as `FilterPill`s in one scrollable row with Date, Category, Account, Member. |
| P1 | "Add expense" here vs "Add purchase" elsewhere. | Use "purchase" everywhere in UI copy. |
| P1 | Money in / out / Net cards are cramped and Net isn't styled. | One summary strip: "In +$4,698.94 · Out −$1,141.85 · Net +$3,557.09", or keep three but with equal width, smaller labels, Net in teal when positive. |
| P2 | Date header "Wed, October 14" sits inside a white card with rows. | Sticky date headers outside cards ("Today", "Yesterday", "Wed, Oct 14"), rows on plain surface, with daily total on the right. |
| P2 | Search box always visible takes space. | Search icon in header that expands. |
| P1 | Edit income has no delete, "Owner: User" select. | Add "Delete income" text button at bottom with confirm. Owner = member names with avatars. |
| P2 | Amount field is a small text box. | Big centered amount input like Add purchase. |

---

## 4. Budget (#7), Category sheet (#8, #9)

| Sev | Issue | Fix |
|---|---|---|
| **P0** | **#9: "Save category changes" button overlaps and garbles the "Rent / Mortgage" title** when scrolled. | Fix stacking/sticky positioning in the category sheet; header stays above content (`z-index`), and the save button should only exist in edit mode (below). |
| P1 | Donut in summary card has no center label, and its fill doesn't obviously match 51% ($1,141.85 / $2,245). | Center label "51%" + "used"; verify the arc math. Add "$1,103 left" below. |
| P1 | "Add category" twice (inline + floating). | One small "+ Category" button next to the month switcher. |
| P1 | Row layout: spent amount runs into the progress bar ("$100.00▬▬▬"), BUDGET column is separate. | Row: emoji + name on the left, "$100 of $100" right-aligned on line 1, full-width progress bar on line 2, status text ("$0 left", "$215 over") muted below. Remove the table header. |
| P1 | Rent is 100% used but its bar looks like any other. | Use status colors: < 80% teal, 80–100% amber, > 100% coral + "over" text. |
| P1 | Category name is shown as a card that is also an editable field; "Save category changes" is always visible. | Show name as the sheet title with a pencil "Edit" button. Editing turns it into an input with Save/Cancel. Same for the budget amount. |
| P1 | "Delete category" is a big button right under purchases. | Move to bottom of sheet as a red text button, with confirm dialog ("Delete Rent / Mortgage and its 1 purchase?"). |
| P2 | Purchase row edit/delete icons are tiny. | Use `SwipeActionRow` (swipe left: delete, tap: edit). |
| P2 | Inline Add purchase form inside the category sheet duplicates the global one. | "Add purchase" opens the global Add purchase sheet with this category preselected. |
| P2 | Heavy blur on the empty lower part of the sheet (#8). | Remove; sheet fits content. |

---

## 5. Cash flow (#10–12)

| Sev | Issue | Fix |
|---|---|---|
| P1 | Charts have **no x-axis labels** (which bar is which month/day?). | Add month labels (cash flow) / day or week labels (spend). |
| P1 | Bars + dashed line with no legend; meaning of the dashed line is unclear. | Add a legend ("Income", "Spend", "Net") or remove the dashed line. Prefer: grouped bars Income vs Spend per month, net as a dot. |
| P1 | Spend chart: near-black bars, a floating "$1,141.85" label above the y-axis. | Teal bars, highlight the current period, put the total in the card header, not on the axis. |
| P1 | "Current period" chip looks like a button but isn't clear. | Make it a real period selector: "This month · 3M · 6M · 1Y". |
| P2 | Rainbow category dots; tiny bars. | Muted palette; bars as % of total spend with % label. |
| P2 | Income list repeats the duplicate names (§1.7, §1.8). | Group by normalized source; show count ("Utah Valley Univ · 4 payments"). |
| P2 | Center-aligned headings. | Left-align (§1.13). |

---

## 6. Accounts (#13)

| Sev | Issue | Fix |
|---|---|---|
| **P0** | Three floating buttons cover balances. | §1.1. |
| P1 | Bank connection card is the first thing on the page; "Disconnect" is as prominent as "Refresh". | Move connection status to a small row inside each institution group ("Capital One · Synced Oct 20 · ⟳"). Disconnect goes in an overflow "⋯" menu with confirm. |
| P1 | Assets/Debts chart has no axes, no dates, and a large empty area under the line. | Lead with a "Net worth" hero number + change ("+$1,240 this month"), then a compact chart with time range chips (1M 3M 1Y) and a few date labels. |
| P1 | Section headers "Checking 1", "Savings 1" with odd count badges. | "Checking · $1,205.34" header; drop the count. |
| P2 | Account rows: subtitle truncates ("Capital One · Bank connec…"). | Subtitle: "Capital One ••1234". Balance right-aligned, never covered. |

---

## 7. Investments (#14–16)

| Sev | Issue | Fix |
|---|---|---|
| **P0** | Floating buttons cover time-range chips and holdings. | §1.1. |
| P1 | Blue "Add holding" button, lime chart, blue Fidelity icon. | Teal + chart tokens (§1.9). |
| P1 | Time-range chips sit below the chart and are partly hidden. | Put them directly above or below the chart, always visible; selected chip teal. |
| P1 | "Your top movers for today" + red daily arrows works against the calm, long-term positioning. | Replace with "Holdings" sorted by value, showing total gain/loss since purchase. Daily change only as small muted text. |
| P1 | Holding names truncated ("SPDR S&P 5…") despite empty space; unexplained red/green split bar under each card. | Row layout: ticker badge + full name (2 lines allowed), value right, gain "+$1,240 (5.9%)" below. Remove the split bar or label it ("Gain vs cost"). |
| P2 | Holdings as large cards waste space. | Use `ListRow`s. |
| P2 | Allocation is a single bar for one account. | Show allocation by holding or asset class as a donut or stacked bar with legend. |
| **Data** | $53,598.84 here vs $47,772.49 on Home (§2). | Make consistent. |

---

## 8. Goals (#17) and Add goal (#18)

| Sev | Issue | Fix |
|---|---|---|
| P1 | Blue ring off-palette; huge gap before "Active". | Teal ring; standard section spacing. |
| P1 | Goal row has no progress bar; "$0.00/mo" is bold with no label. | Row: name + target date, progress bar, "$2,500 of $10,000 · 25%", "Saving $0/mo" muted with a nudge: "Save $214/mo to hit Dec 2026". |
| P1 | Tiny edit icon. | Tap the whole row to open the goal; edit inside. |
| P1 | Add goal: "Emergency fund" placeholder looks filled; `0` defaults; Target amount has no "$" (Edit income does). | §1.6; all money inputs use the same `MoneyInput` with "$" prefix. |
| P2 | Monthly contribution is manual. | Auto-suggest it from target amount and date ("$214/mo"), editable. |
| P2 | Empty state for no goals. | `EmptyState` with illustration: "Save for something together" + "Add a goal". |

---

## 9. Premium polish (after P0/P1)

1. **`Money` component everywhere:** dollars large and bold, cents smaller and lighter, tabular numerals, minus sign for negatives.
2. **One hero number per screen**, everything else smaller.
3. **Motion:** numbers count up on first load, rows fade in with a short stagger, buttons press-scale to 0.97, sheets spring up. All respect `prefers-reduced-motion`.
4. **Haptic-feel feedback:** toast "Purchase added · Undo" after every save.
5. **Microcopy:** friendly and short. "You're $215 over on Shopping" instead of "$215.00 over". "All caught up" when nothing to review.
6. **Dark mode pass** on every screen in this audit (none of the screenshots show dark).
7. **Skeleton loaders** shaped like the real cards instead of blank space.

---

## Fix order (one branch per batch)

1. **`fix/layout-p0`** — §1.1 floating buttons + context-aware **+**, §1.2 bottom padding, §1.3 header fade, §4 #9 title overlap, §2 "0 days left" bug (+ tests).
2. **`fix/data-display`** — §1.7 dates, member names, title-case display; §1.8 duplicate-income investigation (report only); §2/§7 net-worth vs portfolio mismatch (report + fix display).
3. **`fix/header-nav-sheets`** — §1.4 header, §1.5 bottom bar, §1.10 sheets, §1.6 placeholders, §1.11 inputs.
4. **`fix/home`** — all of §2.
5. **`fix/transactions-budget`** — §3 and §4.
6. **`fix/cash-flow-charts`** — §5, §1.9 palette for charts.
7. **`fix/accounts-investments-goals`** — §6, §7, §8.
8. **`polish/premium`** — §1.12, §1.13, §9.

For every batch, the report must include before/after screenshots at 390px width in light AND dark mode for each touched screen.
