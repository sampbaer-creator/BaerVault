# Investments surface brief

- Primary target: `app/investments/page.tsx`
- Related targets: `components/investments/InvestmentsWorkspace.tsx`, `components/investments/InvestmentsWorkspace.module.css`, `app/api/market-data/route.ts`
- Mode: Operate
- Thesis: A protected account ledger that turns manual ownership records and live market history into understandable household progress.
- Hierarchy: household portfolio value first; accounts second; spreadsheet-like holdings third; holding history and lots in a contextual drawer; scenario projections last.
- Data: accounts, holdings, and purchase lots are user-owned records; prices/history come from a server-only Twelve Data integration.
- Projections: scenario math only, never predictive claims; assumptions remain visible and adjustable.
- Mobile: account tabs scroll horizontally, holdings recompose to identity/value/gain rows, and holding detail opens in a bottom drawer.
