# Product


## Platform

web

## Users

Households, including spouses or household members, who need a shared and approachable view of their finances across desktop and mobile.

## Product Purpose

BearVault helps a household understand its current financial position, build monthly spending from category-level purchases, track income and transactions, maintain investments, and plan ahead. Success means the household can answer how it is doing financially without navigating a complex accounting interface or trading terminal.

## Positioning

BearVault combines a calm household-finance overview with explicit shared-household organization, prioritizing clarity, trust, and long-term financial confidence over transaction volume or market speculation.

## Operating Context

Users review their financial position at a glance, add purchases directly to monthly budget categories, record income in Transactions, maintain investment holdings, and share the workspace with another household member. Budget is the primary spending-entry workflow; Transactions is the unified ledger for money in and money out. The product must work comfortably on phones and larger screens.

## Capabilities and Constraints

- Next.js App Router application using TypeScript, Mantine, Tabler Icons, Recharts, and CSS Modules without Tailwind.
- The public demo uses realistic mock data, while protected pages use household records stored in Supabase.
- Clerk authentication, Clerk household organizations, Supabase persistence, and the Twelve Data market-data integration are active. Direct bank connections, payments, email, and analytics are not currently integrated.
- The responsive application shell remains stable. Primary navigation is Dashboard, Transactions, Accounts, Budgets, Investments, Goals, Household, and Settings.
- Financial data must use clear formatting and tabular numerals where appropriate.

## Brand Commitments

- Product name: BearVault.
- The supplied BearVault logo combines a bear silhouette, vault/security geometry, and an upward financial trend in deep navy and muted green.
- The product should feel premium, calm, trustworthy, financially serious, precise, modern, polished, and approachable.
- Origin-quality personal-finance hierarchy and restrained Apple-style Liquid Glass are binding references, without copying proprietary layouts, assets, or branding.
- Bear and vault cues remain subtle rather than decorative or literal throughout the interface.

## Evidence on Hand

- BearVault logo and app-icon presentation: `C:\Users\10953612\Downloads\TruBaer Logo and App Icon Presentation(3).png`.
- Dashboard reference: `C:\Users\10953612\Downloads\d802a3b4-fd5f-4c01-b2d1-10ae53ced20c.png`.
- Origin personal-finance reference: `C:\Users\10953612\Downloads\7aafb6db-96b0-41d5-a492-076cad74f02e.png`.
- No production customer data, testimonials, account balances, or connected financial records exist yet; UI data must remain clearly synthetic.

## Product Principles

1. Make the household's current financial position immediately legible.
2. Use hierarchy instead of a card for every metric.
3. Keep financial numbers precise and readable before adding visual flourish.
4. Make shared household finances feel secure, calm, and manageable.
5. Adapt intentionally to mobile rather than shrinking desktop layouts.

## Accessibility & Inclusion

Maintain semantic structure, keyboard access, visible focus states, strong contrast, touch-friendly controls, reduced-motion support, and layouts resilient to narrow screens and text scaling.
