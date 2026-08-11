# Budget surface brief

- Primary target: `app/budget/page.tsx`
- Related targets: `components/budget/BudgetWorkspace.tsx`, `components/budget/BudgetWorkspace.module.css`
- Mode: Operate
- Thesis: A protected monthly worksheet where purchases—not overwritten totals—are the atomic spending input.
- Hierarchy: month and available cash first; concise plan/actual/remaining rail second; category worksheet third.
- Desktop behavior: stable financial columns open a right-side category workspace without losing scan context.
- Mobile behavior: compact category progress rows open a bottom drawer optimized for fast purchase entry.
- Material: one selective-glass summary plane; the worksheet and drawer are opaque precision surfaces.
- Motion: repeated row and entry actions prioritize immediate response; only drawer spatial transition and short press feedback remain.
