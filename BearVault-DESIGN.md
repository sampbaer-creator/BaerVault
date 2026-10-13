# BearVault Design System and Review Guide

This is the combined product design source for BearVault, the household finance web app. Use it when building, changing, or reviewing its interface. The product name is BearVault; preserve existing BaerVault repository names, imports, routes, and database identifiers unless a separate task authorizes changes.

## 1. Design thesis

A calm household ledger that makes the next money decision clear.

BearVault should feel precise, protected, and approachable. Its signature is the relationship between a quiet floating navigation shell and an orderly, solid financial workspace. Its character comes from navy typography, aligned amounts, deliberate spacing, and clear household language. Restraint is part of the design.

The primary screen questions are:

- What can we safely spend, based on what is actually known?
- What changed in our money?
- What needs our attention?
- Where can we review or edit the underlying records?

A screen should answer its main question before offering supporting detail. Keep financial records practical enough for repeated daily use.

## 2. How to apply this guide

Before changing a screen, inspect the existing components, theme tokens, behavior, and data contracts. State its single purpose and the most important user action. Reuse working patterns before adding another component variant.

This is a responsive web app. Apply Apple-inspired principles of clarity, familiarity, flexibility, agency, and craft while retaining browser and web accessibility conventions. Native Apple tab bars, system menus, settings windows, and point units are not mandatory web requirements. CSS blur is a web material treatment, not a claim of native Liquid Glass behavior.

User instructions govern the task. Within that scope, prioritize accessibility and accurate financial meaning, then task completion, consistent components, product identity, and decorative polish.

A design specification does not establish implementation quality. Verify the rendered interface and its behavior before calling a change complete.

## 3. Material hierarchy

| Layer | Treatment | Examples |
| --- | --- | --- |
| Page field | Calm, nearly neutral background | Main application canvas |
| Navigation shell | Restrained translucent material when supported | Sidebar, header, mobile navigation |
| Financial content | Opaque application surface | Safe to Spend, net worth, budgets, charts, holdings |
| Detailed records | Opaque surface, aligned columns, quiet separators | Transactions, categories, account rows |
| Editing and dialogs | Opaque surface, clear boundaries | Forms, sheets, confirmation dialogs |

Glass belongs to navigation chrome. Keep financial summaries, charts, dialog bodies, form fields, and data rows solid. Navigation text and controls must remain legible over every underlying surface.

Use one faint palette-derived ambient wash near the shell if it improves separation. The workspace remains visually neutral. Avoid large gradients, colored blobs, pronounced refraction, glossy highlights, and decorative shadows.

Provide a solid fallback when backdrop filtering is unavailable. Provide an opaque mode for reduced transparency where the platform exposes it, plus an application-level fallback if needed. Increased contrast strengthens boundaries and secondary text. Never make blur necessary for understanding hierarchy.

## 4. Color tokens

These are the default palette. Implement roles through shared theme tokens rather than scattered hex values. Other palettes must pass the same semantic and contrast checks.

| Token | Light | Dark | Role |
| --- | --- | --- | --- |
| canvas | #F7F8FA | #0C1420 | Page field |
| surface | #FFFFFF | #141F2E | Financial content and forms |
| surface-raised | #F0F3F7 | #1D2A3C | Tonal controls and grouped detail |
| ink | #062650 | #E8EEF7 | Primary text and amounts |
| muted-ink | #56657A | #A5B3C7 | Dates, supporting labels, explanations |
| accent | #245EDB | #8CB4FF | Primary actions, links, selected state |
| on-accent | #FFFFFF | #0C1420 | Filled-action text |
| accent-soft | #EDF3FF | #20334F | Selected background |
| positive | #137548 | #6BD49B | Confirmed positive movement |
| negative | #A3432A | #F2A18B | Debt-related comparisons |
| destructive | #B02D43 | #FF91A3 | Errors and destructive actions |
| border | #DCE2E9 | #33445B | Decorative separators |
| control-border | #748196 | #7489A6 | Required field and control boundaries |

Semantic rules:

- One role has a consistent meaning across screens.
- Green means a confirmed positive financial state, never generic decoration.
- Debt is not automatically an error. Use negative and destructive roles separately.
- Pair state colors with text, signs, icons, or other visible cues.
- Chart categories may use a separate categorical palette; include labels and distinguishable marks.
- Preserve browser focus visibility and selected-state clarity across every palette.
- Default appearance follows the system. A web preference for System, Light, or Dark is allowed if settings already support it.

Contrast gates use actual rendered combinations:

- Normal text: at least 4.5:1.
- Large text: at least 3:1, using the web definition of at least 24 CSS px regular or approximately 18.67 CSS px bold.
- Essential control boundaries, states, and graphical objects: at least 3:1 against adjacent colors where required.
- Quiet decorative separators may be lower contrast when they are not necessary to identify a control or understand content.
- Evaluate translucent surfaces after compositing. Base hex values alone cannot establish their contrast.

Verify colors when introducing a new surface or state. Do not assume every pair of tokens is approved.

## 5. Typography

Use the existing self-hosted Manrope family with system sans-serif fallbacks. One family is enough. Use available font weights consistently; avoid many nearly identical custom weights.

| Style | Size | Weight | Line height | Use |
| --- | --- | --- | --- | --- |
| Lead amount | clamp(32px, 4vw, 48px) | 650 or supported equivalent | 1.1 | One leading financial value |
| Page title | clamp(24px, 2.5vw, 32px) | 650 | 1.2 | Page identity |
| Section title | 16px | 650 | 1.35 | Financial sections |
| Body | 16px | 400 | 1.5 | Explanations and form text |
| Data and controls | 14-16px | 450-600 | 1.4 | Rows, buttons, navigation |
| Secondary metadata | 13px | 450 | 1.4 | Dates and supporting detail |

Use relative units for implementation. Mobile input text is at least 16px. Do not place important actions, financial amounts, or error messages in tiny text. Avoid all-caps labels and eyebrow headings above page titles.

Amounts use tabular lining numerals. Right-align comparable numerical columns and preserve decimal alignment. Use one currency convention per context; show the currency when ambiguity is possible. Negative amounts include an explicit sign or meaningful wording.

Support browser zoom and text enlargement. Avoid fixed-height text containers and clipped values. At narrow widths or larger text sizes, reduce density before reducing type size. Full amounts must remain accessible when a compact display is used.

## 6. Layout and geometry

Keep the desktop shell allocation at 264px with a 240px sidebar inset by 12px when that matches the existing implementation. The desktop header starts from 64px but may grow with text. The content maximum is 1440px with fluid horizontal padding from 24px to 40px.

Below 48rem, use a compact header and bottom navigation. Page padding is 16px, reduced to 14px only when necessary. Account for top and bottom safe areas and reserve content space for fixed navigation.

Use content-driven breakpoints. Existing 48rem and 70rem breakpoints are starting points, not reasons to tolerate cramped layouts. Verify 320px, 390px, 768px, 1024px, and 1440px widths, plus intermediate resizing.

| Token | Value |
| --- | --- |
| Spacing scale | 4, 8, 12, 16, 24, 32, 48px |
| Control radius | 11px |
| Content-plane radius | 16px |
| Floating-shell radius | 18px |
| Hairline | 1px |
| Default control height | 44px |
| Touch target | At least 44 by 44 CSS px |
| Mobile navigation target | At least 48px tall |

These are product targets, not statements of native point sizing. Smaller desktop icons may have larger invisible hit regions as long as targets do not overlap.

Use whitespace and separators to group related records. Put a panel around a meaningful task or data group, not every number. Default content panels have no shadow. Use a subtle shadow only when it explains an overlapping or floating layer.

## 7. Navigation

Keep top-level destinations stable. Use familiar labels, icons with a consistent stroke weight, and visible text. Show current location using shape or fill as well as color. Provide hover, focus, and pressed states.

For mobile, retain the existing five-destination arrangement during visual work unless navigation changes are authorized. If restructuring is in scope, select direct destinations from observed frequent tasks. Keep essential daily work one tap away; put infrequent account and preference destinations in a clearly labeled menu. A More destination is acceptable for this web app when its contents are discoverable.

Do not rename routes or reorganize information architecture as an incidental styling change. Support browser Back and Forward, direct URLs, and predictable return from dialogs. Preserve an in-progress edit when reasonable. Fixed bars must not cover records, focused fields, validation messages, or the software keyboard.

## 8. Financial screen composition

### Dashboard

Lead with the most useful trustworthy financial fact. Safe to Spend can lead only when its inputs and calculation exist. Otherwise lead with recorded current position and explain the missing information plainly.

Use one broad solid overview section. Follow it with this month's budget position and recent activity. On desktop, supporting sections may share a row when comparison benefits. On mobile, order them by decision importance.

Safe to Spend displays the amount, the time horizon, a short basis statement, data freshness, and a link to the calculation or contributing records. Missing obligations or incomplete account data must be visible. Never imply a guaranteed spending allowance from incomplete data.

Net worth shows current assets, debts, and valuation status. Budget progress shows actual spending against planned spending, with recorded income as supporting information. Do not add a chart to fill space.

### Transactions and cash flow

Use an editable ledger with a clear column hierarchy: date, description, category, account, and amount where available. Keep text left-aligned and amounts right-aligned. Sorting, filtering, and search should be visible and predictable.

Mobile records retain description, amount, date, and the next useful action. Reveal secondary detail on demand. Swipe actions may supplement visible or keyboard-accessible actions.

### Budgets and categories

Keep planned, spent, and remaining values aligned. Provide explicit Save and Cancel for edits. Over-budget states retain the true overage in text. Cap the visual fill if necessary without hiding the actual value.

### Investments and accounts

Separate current valuation, contributed capital, and return. Include quote timing and unavailable-price states. A historical return chart requires genuine historical data and a defined method. Show account connection and synchronization status near the relevant account.

### Household and goals

Make ownership and sharing clear. Explain who can view or edit financial records before invitation or permission changes. Goals show recorded contributions and progress. Projected completion dates require a visible assumption and projected label.

## 9. Evidence and trust

Use observed, inferred, and projected labels when the distinction affects a decision:

- Observed: directly recorded or returned by a provider, with relevant timestamp.
- Inferred: derived classification or estimate, with its basis and a correction path.
- Projected: future scenario based on stated assumptions.

Derived totals can be described by their calculation without labeling every field inferred. Be precise about what a label means.

Never invent trend percentages, historical snapshots, bill schedules, balances, investment returns, or predictions. Distinguish zero, missing, stale, unavailable, and loading. Demo data is visibly identified and stays separate from real household data.

A privacy claim must match implemented behavior. Avoid caching private financial responses or displaying sensitive information in diagnostic messages without authorization.

## 10. Components and interaction

### Buttons

Use one dominant action per task region. Primary buttons use accent and on-accent tokens. Secondary buttons are solid tonal or outlined controls. Destructive emphasis belongs to destructive actions. Use concrete labels such as Save changes, Add transaction, or Connect account.

### Fields

Use persistent visible labels, appropriate input types, useful autocomplete, and clear formatting. Place errors next to fields and associate them programmatically. Preserve entered values on failure. Validate at sensible points without interrupting typing. Do not commit a financial edit just because focus leaves a field.

### Dialogs and sheets

One focused task, an obvious dismissal path, managed focus, and an opaque body. Restore focus to the trigger on close. Escape dismisses when doing so is safe. Warn about unsaved changes when needed. Confirm irreversible actions with a clearly named action and Cancel; prefer undo for recoverable changes.

### Loading and feedback

Show immediate feedback. Reserve stable space for loading content. Use determinate progress only when measurable. An unavailable financial value stays unavailable; it never becomes a placeholder zero. Keep unrelated work usable during refresh. Announce important async results without repeatedly reading the whole screen.

### Empty and error states

Explain the condition in one sentence and provide the next useful action. Keep decorative illustrations minimal. Error messages say what failed and how to recover without exposing implementation details.

### Search and filters

Use an accessible search field and correctly implemented combobox when suggestions exist. Keyboard navigation, Escape dismissal, clear selection, filter reset, and result counts must work. Preserve meaningful filter state when returning to a ledger.

## 11. Charts

Every chart must answer a concrete financial question using available data. Include units, period, labels, and useful context. Prefer accessible text summaries and inspectable records alongside charts.

Use line charts for genuine time series, bars for category comparisons, and a simple track for assets versus debts or budget progress when appropriate. Do not use decorative sparklines, fabricated performance, unnecessary donuts, or color-only legends. Tooltips must also be reachable without a mouse.

## 12. Accessibility and motion

Use semantic HTML before ARIA. Every icon-only control has an accessible name. Provide logical headings, label associations, meaningful reading order, and a skip link where useful.

All functionality works by keyboard. Focus is visible with a 2px outline and 2px offset, using a token that contrasts with its actual surroundings. Avoid keyboard traps except properly managed modal focus. Hide decorative icons from assistive technology.

Test reflow and zoom at 200% and 400%. Financial tables may use an explicitly labeled horizontal scroll region where two-dimensional comparison is necessary; the rest of the page must reflow. Important information and actions remain available at enlarged text sizes.

Motion is brief and functional. Prefer subtle opacity and color changes. Avoid springy financial values, staggered dashboard reveals, animated background effects, and scaling on frequent record interactions. Respect reduced motion. Do not delay input or navigation for animation.

## 13. Distinctive craft

Spend visual emphasis in one place: the leading financial fact. Let the rest of the screen support it.

Keep the bear and vault identity in the logo and a few deliberate brand moments. Do not repeat logos throughout the workspace. Manrope, navy ink, aligned figures, and restrained navigation materials carry the identity between those moments.

Avoid generic welcome headings, oversized metric tiles, repeated badges, nested cards, floating AI chat boxes, gradients behind totals, ornamental numbering, excess shadows, and random new font pairings. An assistant feature needs a demonstrated task benefit and user control before it earns space.

Use concise household language. Prefer This month's spending, Remaining budget, and Last updated over clever financial jargon. Use sentence case consistently. No filler, hype, or em dashes in product copy.

## 14. Build and review workflow

1. Inspect the screen, its data, existing tokens, and related flows.
2. State its purpose, lead fact, primary action, and known implementation limits.
3. Identify real accessibility, hierarchy, or interaction problems before restyling.
4. Plan a small change using this system. Check whether it fits BearVault's household workflow.
5. Implement through shared tokens and components. Preserve financial calculations, routes, authentication, and database behavior unless authorized otherwise.
6. Verify the rendered screen at compact and regular widths, in both appearances, and with realistic empty, loaded, loading, stale, and error states.
7. Check keyboard operation, focus, enlarged text, contrast, touch targets, and reduced effects.
8. Remove one unnecessary accessory if one remains. Report concrete changes and any unverified limits.

For an Apple-guideline review, load the actual relevant references when available. Cite only references read. Separate product judgment from sourced platform guidance. This file is self-contained and does not claim to include Apple's reference collection.

Review findings use:

- Critical: prevents access or task completion, or materially misrepresents financial information.
- High: substantial readability, navigation, or editing friction.
- Medium: inconsistent components, weak hierarchy, or avoidable interaction complexity.
- Low: visual polish and minor edge cases.

Report each finding as Problem, Evidence, and Fix. Include measured contrast or sizes when available. Do not rate a screen from specification alone or promise perfection before testing it.

## 15. Completion checklist

- The screen answers its main question immediately.
- Financial values are grounded in real inputs and correctly labeled.
- Solid records and restrained navigation materials have a clear hierarchy.
- Important text, controls, and graphical states pass their contrast gates.
- Amounts align and remain readable with long values and enlarged text.
- Navigation, browser history, editing, dismissal, and recovery work.
- All functions are available by keyboard and named for screen readers.
- Compact screens, safe areas, fixed bars, and keyboards are accounted for.
- Light, dark, reduced motion, and opaque fallbacks remain coherent.
- No unnecessary cards, decorative charts, or generic dashboard filler remain.
- Existing project checks appropriate to the change pass; unresolved limits are stated.
