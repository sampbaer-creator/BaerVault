---
name: BearVault
description: A calm, protected household-finance cockpit built from selective glass and precise solid records.
colors:
  protected-navy: "#062650"
  accent-blue: "#3578f6"
  accent-soft: "#edf3ff"
  growth-green: "#16834f"
  destructive: "#b84352"
  debt-coral: "#df785d"
  chart-blue: "#4f8ff7"
  chart-green: "#09b85a"
  canvas: "#f7f8fa"
  surface: "#ffffff"
  surface-raised: "#f0f3f7"
  border: "#e0e4ea"
  muted-ink: "#7d89a2"
typography:
  display:
    fontFamily: "var(--font-manrope), system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "clamp(38px, 5vw, 62px)"
    fontWeight: 680
    lineHeight: 1
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "var(--font-manrope), system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "clamp(28px, 3vw, 38px)"
    fontWeight: 690
    lineHeight: 1.1
    letterSpacing: "-0.035em"
  title:
    fontFamily: "var(--font-manrope), system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "14px"
    fontWeight: 720
    letterSpacing: "-0.015em"
  body:
    fontFamily: "var(--font-manrope), system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "var(--font-manrope), system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "11px"
    fontWeight: 650
rounded:
  control: "11px"
  panel: "16px"
  mobile-panel: "15px"
  shell: "18px"
  pill: "999px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "18px"
  lg: "24px"
  xl: "48px"
components:
  button-primary:
    backgroundColor: "{colors.accent-blue}"
    textColor: "{colors.surface}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    height: "42px"
  panel-solid:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.protected-navy}"
    rounded: "{rounded.panel}"
    padding: "24px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.protected-navy}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    height: "42px"
  nav-active:
    backgroundColor: "{colors.accent-soft}"
    textColor: "{colors.accent-blue}"
    rounded: "{rounded.control}"
    padding: "9px 11px"
    height: "42px"
---

# Design System: BearVault

## Overview

**Creative North Star: "The Refracted Vault"**

BearVault is a premium, calm household-finance workspace whose material hierarchy separates orientation from record keeping. The shell floats as selective glass: desktop sidebar, desktop header, responsive mobile header, five-item mobile navigation, dialogs, and high-level summary planes may refract the palette beneath them. Tables, activity lists, category rows, holdings, forms, and other detailed financial surfaces remain solid so numbers and actions never compete with the material effect.

The page field is not a flat neutral. Soft radial color from the active palette sits behind the shell and summary planes, making glass feel native to every light, dark, and user-selected palette. The default ledger palette is protected navy and blue, but the system's real invariant is semantic contrast: strong ink, quiet metadata, one measured accent, meaningful positive/negative color, and opaque reading surfaces.

**Key Characteristics:**

- Floating selective glass for shell chrome and high-level summary planes.
- Solid, calm record and form surfaces for financial precision.
- Palette-aware ambient backgrounds rather than fixed decorative gradients.
- Gently vault-like geometry: 16px panels and 11px controls.
- Current recorded data leads; projections are never invented to fill a dashboard.
- Deliberate mobile recomposition with a compact header and five-item bottom navigation.

## Colors

The palette is role-driven. The default ledger theme uses protected navy, clear blue, and cool neutrals; selectable finance palettes remap the same semantic roles across light and dark modes while retaining financial meaning and contrast.

### Primary

- **Protected Navy:** Strong text, brand authority, and the default palette's deepest structural color.
- **Accent Blue:** Active navigation, primary actions, focus, links, and primary chart marks.

### Secondary

- **Growth Green:** Confirmed positive money movement and healthy progress only.
- **Debt Coral:** Debt composition and other bounded negative comparisons that need more distinction than neutral text.
- **Destructive Red:** Errors and destructive actions; it is not a general chart color.

### Neutral

- **Canvas:** Base page field beneath ambient palette color.
- **Surface:** Solid record panels, tables, rows, and forms.
- **Surface Raised:** Quiet controls, tracks, and tonal separation inside solid surfaces.
- **Border:** Low-contrast separation for detailed data regions.
- **Muted Ink:** Dates, labels, explanations, and supporting metadata.

### Named Rules

**The Semantic Palette Rule.** Palette selection may change hues, but it must preserve the roles of strong text, accent, focus, positive money, negative money, surface, and border.

**The Ambient Field Rule.** Background color appears as low-chroma radial atmosphere derived from the active palette; it supports glass and never becomes ornamental page art.

**The Meaningful Color Rule.** Green, coral, and destructive red must describe financial or interaction state, not decorate otherwise neutral records.

## Typography

**Display Font:** Manrope (self-hosted by Next.js, with system sans-serif fallbacks)

**Body Font:** Manrope (self-hosted by Next.js, with system sans-serif fallbacks)

**Character:** Manrope keeps the application modern and approachable while compact, moderately heavy headings create financial authority. The hierarchy is intentionally restrained: large type is reserved for a singular total, while everyday panels rely on small, clear headings and labels.

### Hierarchy

- **Display** (680, fluid 38–62px, 1 line-height): Singular current totals such as net worth.
- **Headline** (690, fluid 28–38px, 1.1 line-height): Page-level statements when the shell title alone is not enough.
- **Title** (720, 14px): Panel and data-section headings.
- **Body** (400, 15px, 1.5 line-height): Explanations, guidance, and longer form content.
- **Label** (650, 10–12px): Controls, metadata, table support, compact values, and links.

### Named Rules

**The Stable Number Rule.** Financial amounts use tabular lining numerals, compact tracking, and alignment that keeps comparisons stable.

**The Direct Title Rule.** Do not place eyebrow kickers above page headings. Start with the title or the financial fact; use ordinary metadata labels only inside the surface they describe.

## Layout

The desktop shell floats over the ambient page field. Its 264px allocation contains a 240px glass sidebar inset by 12px. The content column begins after that allocation, and its 64px glass header floats 12px from the viewport edges. Main content is centered at a maximum width of 1540px with fluid 22–48px horizontal space and generous top breathing room below the header.

Dashboard composition follows current recorded data. A wider current-position plane leads beside this-month budget progress; recent activity, top spending categories, and an evidence-bound planning-ahead state follow. The current-position plane shows present net worth, assets, and debts rather than a fabricated historical chart. The budget plane shows remaining or over-plan status, a real progress bar based on spending versus planned amount, and the recorded spent, planned, and income totals. Empty and unavailable states say what is missing instead of substituting projections.

At 70rem the dashboard becomes a single column. Below 48rem, desktop chrome yields to a 66px mobile header and a fixed glass bottom navigation with five equal destinations: Dashboard, Transactions, Budgets, Investments, and More. The More destination opens Accounts, Goals, Household, and Settings. Mobile content uses safe-area insets, 14–16px page edges, at least 44px interactive targets, solid stacked records, and shorter summary layouts rather than compressed desktop grids.

**The Current Evidence Rule.** Dashboard modules may summarize current accounts, holdings, budget entries, income, purchases, and goals; they must not imply forecasts, bill schedules, or historical performance that the household has not recorded.

**The Mobile Recomposition Rule.** Reorder and stack information around the next mobile task; do not shrink a desktop grid into a narrow viewport.

## Elevation & Depth

BearVault uses depth selectively. Floating shell chrome and summary planes combine translucent palette-aware gradients, a bright edge, 28–30px backdrop blur, a subtle inset highlight, and a broad ambient shadow. Solid record and form panels use tonal contrast, a quiet border, and a much smaller shadow. The distinction must remain obvious: glass orients and summarizes; opaque surfaces support reading, editing, and comparison.

### Shadow Vocabulary

- **Solid Surface** (`0 10px 30px rgb(18 35 68 / 7%)`): Quiet lift for record panels without making every row feel like a card.
- **Glass Plane** (`0 20px 55px rgb(17 30 62 / 12%), inset 0 1px 0 rgb(255 255 255 / 94%)`): Floating shell chrome and summary planes in the light theme.
- **Dark Glass Plane** (`0 24px 64px rgb(0 0 0 / 36%), inset 0 1px 0 rgb(255 255 255 / 14%)`): The same material role in dark mode.
- **Mobile Navigation** (`0 18px 54px rgb(17 30 62 / 20%), inset 0 1px 0 var(--glass-highlight)`): Separation above content and the safe-area edge.

### Named Rules

**The Selective Glass Rule.** Glass belongs to floating chrome, dialogs, high-level summaries, and hero-like overview planes—not tables, transaction rows, holdings, category records, or form bodies.

**The Accessibility Fallback Rule.** Reduced transparency replaces glass with an opaque application surface, and increased contrast strengthens borders and muted text without changing hierarchy.

## Shapes

The form language is stable and gently vault-like. Standard panels and summary planes use 16px corners; the narrow-screen panel adjustment is 15px. Buttons, navigation items, inputs, and compact controls use 11px corners. Floating sidebar and bottom-navigation shells use 18px corners. Pills are reserved for progress/status or segmented choices, while record rows stay rectangular within their parent surface rather than becoming nested capsules.

**The 16/11 Rule.** Use 16px for application planes and 11px for controls. Deviate only for the established 18px floating shell, 15px mobile panel adjustment, circular icons, or true pills.

## Components

### Summary Planes

- **Material:** Palette-aware selective glass with a bright edge, backdrop blur, inset highlight, and broad ambient shadow.
- **Purpose:** High-level financial orientation such as current position, monthly budget summary, account/goal metrics, investment overview, or household status.
- **Content:** One clear lead value or statement with a compact supporting rail; avoid filling the plane with nested cards.

### Cards / Record Containers

- **Shape:** Solid 16px panels, adjusted to 15px on mobile.
- **Background:** Nearly opaque application surface with a quiet semantic border.
- **Depth:** Small solid-surface shadow; rows are grouped by whitespace and hairlines.
- **Use:** Transactions, accounts, holdings, budget categories, goals, settings, tables, and other detailed records.

### Inputs / Forms

- **Shape:** 11px controls at 42px default height; mobile controls keep at least 44px and use 16px input text to avoid iOS zoom.
- **Background:** Solid or nearly opaque surface, even when the containing dialog uses glass chrome.
- **Focus:** Visible 2px semantic focus outline with 2px offset.
- **State:** Disabled controls remain legible; errors use destructive color and text, not color alone.

### Buttons

- **Shape:** 11px corners, compact but touch-safe sizing, and no ornamental shadow at rest.
- **Primary:** Semantic accent fill with white text.
- **Secondary:** Tonal solid surface with semantic border and strong text.
- **Hover / Focus:** Hover shifts border or tonal fill; press scales subtly unless reduced motion is active; focus remains a visible 2px outline.

### Navigation

- **Desktop:** The glass sidebar is visually detached from the viewport. Quiet 42px routes use 11px corners; the active route receives accent-soft fill, accent emphasis, and a faint inset edge.
- **Header:** Desktop and mobile headers are separate responsive compositions, not one layout merely compressed. Both float as selective glass.
- **Mobile:** A fixed five-item glass bar uses four direct destinations plus More, 54px minimum targets, icons over labels, and a solid accent-soft active state.

### Dashboard Current Position

The widest dashboard plane leads with recorded current net worth, then an assets-versus-debts composition track and two-value summary. Live investment pricing may update the total; unavailable prices produce an explicit status rather than a misleading estimate.

### Budget Progress

The monthly budget plane leads with remaining or over-plan money, then a progress bar whose accessible range is actual spending against planned spending. Spent, planned, and income form a compact supporting rail. Category progress elsewhere follows the same calculation and caps visual fill at 100% while retaining the true over-budget amount in text.

## Do's and Don'ts

### Do:

- **Do** let glass float over ambient color only where it communicates shell, summary, or dialog hierarchy.
- **Do** keep records, tables, financial rows, and form fields solid and immediately legible.
- **Do** use the 16px panel and 11px control geometry consistently.
- **Do** derive ambient background color from the active palette in both light and dark themes.
- **Do** make current recorded position, real monthly budget progress, and recent activity the dashboard's strongest reads.
- **Do** preserve the mobile header, safe-area spacing, and five-item bottom navigation.

### Don't:

- **Don't** add eyebrow kickers above page titles.
- **Don't** spread blur and translucency through detailed record or form surfaces.
- **Don't** invent historic charts, projected bills, future cash flow, or market narratives from data the household has not recorded.
- **Don't** turn every metric or row into a detached card.
- **Don't** hard-code decorative atmosphere that ignores the selected palette or dark mode.
- **Don't** adopt crypto-terminal, trading-dashboard, generic admin, or AI-SaaS visual patterns.
