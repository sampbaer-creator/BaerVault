# Design review: BaerVault

Reviewed 13 October 2026 with the project's Apple Design skill. Platform: Next.js web app and installable PWA; audience: households sharing financial records. Source review covered the landing page, authentication and onboarding wrappers, every financial workspace, the shared shell, themes, interactions, and PWA assets. Browser review covered all ten public demo workspaces and the landing page. The same shared workspaces power most protected routes.

## Summary

Initial rating: **Critical issues**, based on source-confirmed dark-mode failures and inaccessible controls. The resulting direction is a calm household ledger: protected navy, readable financial values, solid records, and restrained navigation chrome. This is intentionally a quiet utility; its identity comes from financial clarity and shared-household context.

The implementation applies Apple's foundations and design craft to a web app. It does not claim native HIG conformance, a WCAG certification, or full verification of protected household flows.

## Critical findings addressed

- **Critical — Appearance and contrast.** Mobile overrides forced white cards underneath dark-theme text and used a fixed blue header. White text on the original #007aff accent measured 4.02:1. Financial content and chrome now use theme-aware semantic tokens; primary labels measure 6.04:1 in light appearance and 7.41:1 in dark appearance. See `accessibility.md > Vision`: “Strive to meet color contrast minimum standards.” [Apple accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility)
- **Critical — Hidden or gesture-dependent controls.** Mobile CSS hid goal deletion and page-level actions, and touch rows exposed actions only by swiping. Actions are now visible or reachable through an explicit row Actions button; drawers have named close controls and keyboard dismissal. See `accessibility.md > Mobility`: “Offer alternatives to gestures.” [Apple accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility)
- **Critical — Readability and clipping.** Many labels used 9–11px type, summaries ellipsized financial values, and intermediate layouts squeezed fields beside the sidebar. Page metadata generally starts at 13px in rem units. Financial totals wrap or stack; complex tablet-width content uses one column. See `typography.md > Supporting Dynamic Type`: “Make sure your app’s layout adapts to all font sizes.” [Apple typography](https://developer.apple.com/design/human-interface-guidelines/typography)

## Improvements implemented

- **High — Navigation.** Replaced seven scrolling top-level mobile destinations with five persistent bottom destinations. All pages remains available from a labeled header control; there is no overflow tab. Added Cash flow and Recurring to full navigation and preserved browser history when the live mobile pager changes routes. See `tab-bars.md > Best practices`: “Include tab labels to help with navigation.” [Apple tab bars](https://developer.apple.com/design/human-interface-guidelines/tab-bars)
- **High — Financial truthfulness.** Removed decorative account/holding sparklines and account-name-derived daily gains. Holding changes use actual available closing prices or say Change unavailable. Demo history and hypothetical future growth are labeled. Historical values of current holdings are described as market history, not personal portfolio performance. This is reviewer judgment grounded in the product's trust requirement.
- **High — Material hierarchy.** Financial summaries, records, charts, and forms are solid; glass is reserved for functional chrome, with an opaque accessibility fallback. See `materials.md > Liquid Glass`: “Don’t use Liquid Glass in the content layer.” [Apple materials](https://developer.apple.com/design/human-interface-guidelines/materials)
- **Medium — PWA installation and updates.** Added a 192px icon, removed the portrait lock, aligned theme colors, captured installation prompts centrally, accounted for iPads identifying as Macs, and made worker updates explicit. Offline recovery does not cache household records. This is a web implementation decision informed by the installed Next.js PWA guide.
- **Medium — Writing and state.** Replaced implementation-specific investment copy with user-facing language, made progress labels describe spent and planned amounts, removed the decorative grabber from the full Settings page, and matched authentication styling and product names to BaerVault. See `writing.md > Best practices` for practical labels, useful empty states, and recovery-oriented errors. [Apple writing](https://developer.apple.com/design/human-interface-guidelines/writing)
- **Medium — Formatting.** Investments and cash flow now use the same currency preference as other workspaces. The existing explanation that formatting is not exchange-rate conversion remains.
- **Medium — Motion.** Reduced motion suppresses CSS transitions as well as animations and removes animated swipe-row settling. Navigation remains usable without movement. [Apple motion](https://developer.apple.com/design/human-interface-guidelines/motion)

## Page coverage

| Area | Main change |
| --- | --- |
| Landing | Semantic colors, scalable text, touch-safe calls to action; existing household message retained |
| Dashboard | Solid current-position/budget panels; intermediate-width stacking; readable activity amounts |
| Transactions | Theme-aware ledger, wrapping merchant names, narrow-screen summary/form stacking |
| Accounts | Full balances and metadata, direct actions, no fabricated history line |
| Budgets | Month controls, real summary, stacked category records, explicit spent/planned labels, valid progress ranges |
| Investments | Solid financial surfaces, visible navigation/actions, full values, evidence-backed change labels, labeled projections available on mobile |
| Goals | Solid progress records, visible editing/deletion in the protected workspace, readable demo summaries |
| Cash flow | Solid surfaces, consistent currency formatting, stacking beside the sidebar |
| Recurring | Readable names/dates and responsive records; estimated versus scheduled payments remain distinguished |
| Household | Solid management surface and readable theme-aware copy |
| Settings | Consistent record surfaces, named currency input, touch-sized preferences, intermediate-width stacking |
| Sign in / sign up / onboarding | Solid theme-aware forms, BaerVault authentication titles, consistent system typography and focus |
| PWA / offline | Orientation flexibility, icon coverage, explicit updates, public offline recovery |

## Craft notes

**Medium, resolved:** the prior combination of repeated glass treatments, decorative charts, drifting radii, and per-page mobile overrides obscured the product's point of view. Keep the protected navy, tabular numbers, compact action geometry, and whitespace-led record grouping. Remove ornament when it suggests financial evidence that does not exist.

The new plan is specific to a household ledger: it gives current balances and monthly spending priority, keeps market speculation secondary, and makes shared context explicit. A new display font or motion sequence would not improve that job. The accessory removed was the fabricated sparkline/daily-change treatment.

## What works

Keep real data-driven current position and budget progress, the unified transaction ledger, clear household ownership, keyboard-capable Mantine drawers, explicit empty states, and labeled projection assumptions. The existing reduced-motion hooks and safe-area support were useful foundations.

## Platform notes and verification limits

System appearance remains the default. The explicit light/dark preference is retained as a web-app convenience; Apple's advice against a native app-specific appearance setting is not imposed literally on this cross-platform web product. Native Dynamic Type is approximated with scalable type and browser text enlargement, not advertised as native OS integration. Tabler vector icons are used instead of requiring Apple-only SF Symbols.

Browser checks use demo fixtures and do not exercise real bank connections, live saved household data, MFA, or destructive production actions. Sign-in rendering was inspected with local development authentication. A physical iPhone/iPad installation, keyboard/safe-area behavior in installed Safari, and a full signed-in screen-reader pass still need real-device validation. Contrast checks cover computed colors on reading surfaces; blur, charts, icons, focus order, and assistive-technology behavior require additional human review.

Build, type checking, lint, unit-test results, responsive measurements, and selected screenshots are recorded with the final verification below.

## Verification

- Production build and TypeScript compilation passed.
- ESLint passed with no errors or warnings.
- All 10 unit tests passed, including 5 service-worker privacy, update, and recovery tests.
- All ten demo workspaces loaded at 390px in light and dark appearance. The landing page loaded in both appearances.
- Every demo workspace was checked at 320px with 200% root text size, 768px, and 1440px. The first pass found clipped budget summary values and intermediate-width overflow in Cash flow and Settings. Those layouts were repaired and the failing cases were rechecked with zero overflow and no clipped financial values.
- The production service worker activated with scope /; offline navigation showed the recovery page, and Try again returned to Accounts after reconnecting.
- All pages opened all ten destinations. The account form opened and Escape returned keyboard focus to Add account.
- Primary token contrast was computed from actual hex values: light strong 14.99:1, light supporting 5.97:1, light button 6.04:1; dark strong 15.63:1, dark supporting 7.69:1, dark button 7.41:1.

Production authentication requires configured Clerk keys. The public landing page and demo bypass authentication middleware; private destinations still require it. This review did not create a real user account or connect a bank.

Current assessment: **Good within the verified web/demo scope**. Real-device PWA installation and authenticated assistive-technology checks remain necessary before claiming full accessibility or platform conformance.

## Visual previews

[Light mobile budget](design-review/budget-light.png), [dark mobile budget](design-review/budget-dark.png), [dark desktop dashboard](design-review/dashboard-desktop-dark.png), and [dark mobile dashboard](design-review/dashboard-mobile-dark.png).

The final production check returned HTTP 200 for the landing page and all ten demo workspaces in both appearances, with no page-level horizontal overflow at 390px. Dark-mode measurements were checked after styles settled; primary and supporting text on opaque financial surfaces meet the intended contrast thresholds. This remains a focused UI review rather than a complete automated accessibility certification.
