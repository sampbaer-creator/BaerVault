---
name: BearVault
description: A calm, protected household-finance cockpit built for immediate legibility.
colors:
  protected-navy: "#15243a"
  vault-green: "#315f50"
  growth-green: "#267056"
  soft-green: "#e8f1ed"
  warm-bronze: "#a87546"
  accent-blue: "#365d81"
  accent-bronze: "#8a623d"
  destructive: "#a34444"
  graphite: "#161b22"
  muted-ink: "#66736d"
  canvas: "#f3f5f4"
  surface: "#ffffff"
  border: "#dfe5e1"
  hover: "#f1f3f5"
typography:
  display:
    fontFamily: "var(--font-geist-sans), system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "clamp(40px, 5vw, 62px)"
    fontWeight: 660
    lineHeight: 1
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "var(--font-geist-sans), system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "clamp(28px, 3vw, 38px)"
    fontWeight: 690
    lineHeight: 1.1
    letterSpacing: "-0.035em"
  title:
    fontFamily: "var(--font-geist-sans), system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "15px"
    fontWeight: 680
    letterSpacing: "-0.01em"
  body:
    fontFamily: "var(--font-geist-sans), system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "var(--font-geist-sans), system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "12px"
    fontWeight: 650
rounded:
  control: "10px"
  note: "12px"
  panel: "14px"
  hero: "16px"
  pill: "999px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "18px"
  lg: "24px"
  xl: "40px"
components:
  timeframe-active:
    backgroundColor: "{colors.protected-navy}"
    textColor: "{colors.surface}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "7px 12px"
    height: "36px"
  panel:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.protected-navy}"
    rounded: "{rounded.panel}"
    padding: "24px"
  positive-chip:
    backgroundColor: "{colors.soft-green}"
    textColor: "{colors.growth-green}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "6px 9px"
  nav-active:
    backgroundColor: "{colors.soft-green}"
    textColor: "{colors.vault-green}"
    rounded: "{rounded.control}"
    padding: "10px 12px"
    height: "44px"
---

# Design System: BearVault

## Overview

**Creative North Star: "The Protected Financial Horizon"**

BearVault is a premium, calm, and financially serious household cockpit. Its visual hierarchy makes one protected financial horizon—the household's current position and trend—immediately legible, then lets monthly movement, support measures, budget, investments, and activity unfold with progressively quieter emphasis.

The system combines the stability of deep navy and graphite with muted green reassurance and rare warm bronze categorization. Opaque precision panels carry detailed information; selective translucent glass belongs only on the dominant net-worth plane and compact controls. The result is modern and polished without drifting into generic admin, crypto, trading, or AI-SaaS styling.

**Key Characteristics:**

- One dominant financial surface instead of an equal-weight metric-card grid.
- Precise, tabular financial figures with restrained supporting copy.
- Deep navy structure, muted green state language, and rare warm bronze accents.
- Selective glass for hierarchy; opaque white panels for detailed reading.
- Calm density and deliberate mobile recomposition rather than desktop shrinkage.

## Colors

The palette feels protected and grounded: navy carries authority, green communicates household progress, bronze supplies warmth sparingly, and cool neutrals keep dense financial data quiet.

### Primary

- **Protected Navy:** The dominant value, active timeframe, headings, and highest-authority structure.
- **Vault Green:** Navigation emphasis, links, progress, and the brand's measured financial accent.

### Secondary

- **Growth Green:** Positive movement and incoming-value states; use it for meaning, not decoration.
- **Soft Green:** Low-emphasis active states, positive chips, icons, and supportive notes.

### Tertiary

- **Warm Bronze:** A rare category marker and restrained counterweight to the cool palette.

### Neutral

- **Graphite:** Strong application-shell text.
- **Muted Ink:** Secondary explanations, labels, dates, and metadata.
- **Canvas:** The cool page field behind all dashboard surfaces.
- **Surface:** Opaque detail panels and high-contrast text on dark controls.
- **Border:** Quiet shell and panel separation.
- **Hover:** Low-contrast navigation feedback.

### Named Rules

**The Protected Horizon Rule.** Navy and green establish one dominant financial story; do not distribute equal chromatic authority across every metric.

**The Bronze Rarity Rule.** Warm bronze is a small categorical cue, never a competing primary accent.

## Typography

**Display Font:** Geist Sans (with system sans-serif fallbacks)  
**Body Font:** Geist Sans (with system sans-serif fallbacks)

The operating interface uses a fixed Swiss-derived scale: 12px metadata, 13px controls, 15px body, 18px section headings, 24px shell titles, 30–36px page headings, and large financial figures only where one total genuinely leads the page.

**Character:** The single sans-serif family is clean and approachable, while tightly tracked, moderately heavy headings provide financial authority. Monetary values use tabular lining numerals so comparisons remain stable and precise.

### Hierarchy

- **Display** (660, fluid 40–62px, 1 line-height): Dominant net-worth and other singular financial totals.
- **Headline** (690, fluid 28–38px, 1.1 line-height): Greeting and major page-level statements.
- **Title** (680, 15px): Panel and financial-surface headings.
- **Body** (400, 15px, 1.5 line-height): Calm explanations and status context.
- **Label** (650, 12px): Controls, links, compact values, and metadata; shell section labels may become smaller, heavier, and tracked uppercase.

### Named Rules

**The Stable Number Rule.** Financial amounts use tabular lining numerals, compact tracking, and enough weight to scan before their labels.

## Layout

The application shell uses a fixed 248px desktop sidebar, an 88px sticky header, and a centered content column capped at 1440px. Dashboard content narrows further to 1220px. The first viewport places the greeting above a dominant net-worth/chart surface whose four-part summary rail is integrated into the same plane.

Detail content follows in a two-column grid biased slightly toward budget, with investments beside it and recent activity spanning the full width. At 68rem the summary rail becomes two columns and detail panels stack. Below 48rem the sidebar and desktop header yield to a 64px mobile header and fixed five-item bottom navigation; the hero surface becomes edge-to-edge, the chart shortens, and supporting data becomes a two-by-two rail. Spacing concentrates around an 8/12/18/24/40px rhythm, with comfortable touch targets of at least 44px where navigation or actions require them.

**The Hierarchy Before Grid Rule.** Preserve the net-worth plane as the clear visual anchor; supporting modules may align, but must not become a wall of interchangeable cards.

## Elevation & Depth

BearVault uses a hybrid depth model. Opaque detail panels are defined primarily by cool borders and tonal contrast. The dominant net-worth plane uses a soft directional wash, a thin white edge, inset highlight, restrained ambient shadow, and backdrop blur; compact glass controls echo it without spreading glass across the page.

### Shadow Vocabulary

- **Shell Ambient** (`0 8px 28px rgb(24 32 46 / 4%)`): Barely lifted general surfaces.
- **Protected Plane** (`0 18px 52px rgb(26 45 39 / 9%), inset 0 1px 0 rgb(255 255 255 / 92%)`): The dominant net-worth surface only.
- **Compact Glass** (`inset 0 1px 0 rgb(255 255 255 / 86%), 0 8px 24px rgb(31 54 45 / 6%)`): Small translucent status controls.
- **Active Control** (`0 4px 12px rgb(21 36 58 / 16%)`): Selected pill inside a compact control group.

**The Selective Glass Rule.** Glass is hierarchy, not wallpaper: reserve blur and translucency for the protected financial plane, sticky chrome, tooltips, and compact controls.

### Theme and customization

- Light, dark, and system modes share the same hierarchy and semantic contrast.
- Green is the default accent; blue and bronze are approved restrained alternatives.
- Comfortable and compact density alter spacing and control height without shrinking touch targets below accessibility requirements.
- Reduced motion removes decorative transitions while preserving immediate state feedback.
- Detailed financial tables, lists, and record panels remain opaque in both themes.

## Shapes

The form language is gently vault-like: stable rectangular planes with softened 14–16px corners, compact controls at 10–12px, and fully rounded pills for segmented choices and status. Thin borders are cool and low contrast. Circular geometry appears as a faint oversized motif on the net-worth surface and as tiny category dots, never as literal bear or vault decoration.

## Components

### Timeframe Controls

- **Shape:** A translucent pill group containing 36px-high pill buttons; mobile buttons increase to 38px.
- **Active:** Protected navy with white text and a compact shadow.
- **Hover / Focus:** Hover strengthens text toward navy; focus uses a visible 2px green outline with 2px offset; press scales to 0.97 unless reduced motion is requested.

### Status Chips

- **Style:** Fully rounded soft-green containers with growth-green text, small iconography, and tabular numerals.
- **State:** Communicate positive progress or context; they are not general-purpose decorative badges.

### Cards / Containers

- **Corner Style:** Opaque detail panels use softly stable 14px corners; the dominant glass plane uses 16px.
- **Background:** White for detailed financial reading; a translucent white-to-green wash for the net-worth surface.
- **Shadow Strategy:** Detail panels stay effectively flat; only the protected plane receives meaningful ambient lift.
- **Border:** Thin cool-gray borders on detail panels and translucent white edges on glass.
- **Internal Padding:** 24px on desktop, 18–20px on mobile; the hero expands fluidly from 24px to 40px.

### Navigation

- **Desktop:** Quiet gray labels and icons on white; the active route uses vault-green over soft green with a 10px radius.
- **Mobile:** A translucent fixed bottom bar with five evenly distributed destinations and 54px minimum targets; the active destination repeats the soft-green treatment.
- **Focus:** A clear 2px green outline with 2px offset remains visible across desktop and mobile.

### Financial Summary Rail

The rail belongs inside the net-worth plane. Four evenly weighted figures use muted labels, compact tabular values, and hairline separators; it becomes a two-by-two matrix on smaller screens rather than four detached cards.

### Activity Rows

Rows use soft-green icon tiles, strong merchant names, muted metadata, and right-aligned tabular amounts. Positive income is green; outgoing values use a subdued warm neutral. Hairline separators and whitespace—not nested cards—carry grouping.

## Do's and Don'ts

### Do:

- **Do** make the household's current position the first and strongest financial read.
- **Do** use tabular numerals and right alignment where financial comparisons depend on stable columns.
- **Do** keep detailed budget, investment, and activity surfaces opaque and precise.
- **Do** recompose dense desktop structures for mobile and preserve touch-friendly controls.
- **Do** use subtle bear, vault, and circular security cues only as structural undertones.

### Don't:

- **Don't** turn every metric into an equal-weight card.
- **Don't** spread Liquid Glass across all panels or sacrifice legibility to translucency.
- **Don't** adopt crypto-terminal, trading-dashboard, generic admin, or AI-SaaS visual patterns.
- **Don't** use green or bronze as decoration when they do not carry financial meaning.
- **Don't** replace calm hierarchy with dense widgets, ornamental gradients, or speculative market cues.
