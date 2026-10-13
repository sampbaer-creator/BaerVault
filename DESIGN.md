# Design system: BaerVault

BaerVault is a calm household ledger: help people understand their current position, record spending, and plan together. The signature is protected navy, stable aligned financial values, and restrained solid records. Familiar controls support the work; they do not compete with the numbers.

The Apple Design skill in SKILL.md guides accessibility, hierarchy, materials, and writing. This is a web app and PWA, so native Apple-only requirements are translated into web equivalents rather than imposed literally.

## Semantic colors

Use tokens from app/styles/tokens.css. These ratios apply to the specified opaque surface; translucent chrome requires checking its composed background.

| Role | Light | Dark | Contrast on the reading surface, light / dark |
| --- | --- | --- | --- |
| Reading surface | #ffffff | #1c1c1e | Background |
| Strong content | #062650 | #f5f5f7 | 14.99:1 / 15.63:1 |
| Supporting content | #636369 | #aeaeb2 | 5.97:1 / 7.69:1 |
| Accent | #185dcc | #8ab8ff | Button label 6.04:1 / 7.41:1 |
| Positive money | #18753d | #32d74b | Light reading surface 5.75:1 |
| Error / negative | #c62f36 | #ff6961 | Pair with text, signs, and an actionable explanation |

Accent labels use --app-on-accent: white in light appearance and protected navy in dark appearance. Destructive fills use --app-danger-fill with --app-on-danger, separately from brighter negative text. Do not put white text on the dark theme's pale accent.

Canvas: #f2f2f7 in light appearance, #000000 in dark appearance. System appearance is the default; the web app also permits an explicit light/dark preference. Increased contrast strengthens supporting text and borders. Reduced transparency makes chrome opaque.

## Type and shape

Use the system sans-serif stack, which selects Apple's system font when available. Body text is 1rem; supporting labels generally start at .8125rem. Navigation labels use compact utility sizing; page headings use 1.5-2.5rem, and lead financial values use 2-3.5rem. All financial numbers use tabular numerals. Use rem-based text, flexible heights, and wrapping for full financial values. Do not ellipsize a balance or hide its fractional digits.

Panels use a 1rem radius, controls .6875rem, and floating navigation an 18px radius. Rings and true badges may be circular. Touch controls have at least 44px height and icon actions at least 44px width. Keyboard focus uses a visible semantic outline.

## Material hierarchy

Glass belongs to the functional layer: sidebar, page header, and bottom navigation. Use high opacity and restrained blur. All financial summaries, charts, records, settings sections, and forms are solid. A confirmation dialog may use restrained translucency, with an opaque reduced-transparency fallback.

Avoid decorative history lines. Only recorded data or clearly labeled illustrative demo data may be charted. Historical market prices applied to today's share count are labeled as market history, not personal investment performance. Projections must expose their assumptions and remain labeled as estimates.

## Layout

Compose around the financial task and available content width. The sidebar is 240px wide with a 264px allocation. At less than 48rem, use a compact theme-aware header and five visible bottom destinations: Dashboard, Transactions, Budgets, Investments, Accounts. The header's All pages menu exposes every destination, including Goals, Cash flow, Recurring, Household, and Settings. Do not use scrolling top-level tabs.

At intermediate widths, stack complex content rather than squeezing it beside the sidebar. Mobile records show a name, an untruncated amount, and useful supporting information. Secondary financial details remain available in their detail drawer. Header and footer padding must respect safe areas and leave focused content visible.

Compact:

```text
[All pages]     Page title       [Household / exit]
Demo indicator when applicable
[Current total and supporting values]
[Task actions]
[Solid financial records]
[Dashboard | Transactions | Budgets | Investments | Accounts]
```

Regular:

```text
[Sidebar] [Page title | Search | Task actions | Profile]
          [Current position] [Monthly plan]
          [Financial records] [Supporting context]
```

## Interaction and writing

Use one or two prominent actions per view, with quieter secondary actions. Keep in-page actions beside their content; a floating action must clear bottom navigation. Screen-reader labels name icon-only controls. Drawers trap focus, support Escape and a labeled close button, and return focus to their trigger. Swipe gestures have an explicit Actions alternative on touch layouts. Navigating between pages preserves browser history.

Honor reduced motion in both CSS and animation components. Motion may help orient people, but no essential meaning depends on it. Forms use persistent labels, validation feedback, and visible pending states. Errors explain the next action. Empty states provide a route to useful work. A hypothetical projection never fills a missing recorded-data state.

## PWA

The manifest supports standalone display without locking orientation and includes a 192px icon, the existing 512px icon, and the Apple touch icon. The service worker caches public static assets and the offline recovery page, never account pages, API responses, or mutations. Installation prompts are captured centrally and retained across navigation. iPhone and iPad installation instructions are provided in Settings. Updates require an explicit Update app action so open forms are not reloaded automatically.

## Restraint check

The accessory removed is the fabricated sparkline/daily-change treatment. No extra typeface, decorative hero, or new motion sequence is needed. Financial information is the product's identity. Future work should preserve clear hierarchy, readable amounts, keyboard access, and a calm shared-household voice.
