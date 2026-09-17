import {
  IconArrowRight,
  IconArrowsExchange,
  IconBuildingBank,
  IconChartPie,
  IconCheck,
  IconDatabase,
  IconKey,
  IconLock,
  IconMinus,
  IconPigMoney,
  IconReceipt,
  IconShieldCheck,
  IconTargetArrow,
  IconTrendingUp,
  IconUsers,
  IconWallet,
} from "@tabler/icons-react";
import Link from "next/link";

import { BaerVaultLogo } from "@/components/brand/BaerVaultLogo";
import { TrackedLink } from "@/components/shared/TrackedLink";
import styles from "./page.module.css";

const benefits = [
  {
    icon: IconUsers,
    title: "One household view",
    copy: "Share the same numbers, goals, and financial plan.",
  },
  {
    icon: IconShieldCheck,
    title: "Private by design",
    copy: "Household records are isolated with secure access controls.",
  },
  {
    icon: IconTrendingUp,
    title: "Built for decisions",
    copy: "See what changed and know where your attention belongs.",
  },
] as const;

const productAreas = [
  [IconReceipt, "Spending", "Review transactions and monthly activity."],
  [IconPigMoney, "Budgets", "Plan categories and understand what remains."],
  [IconChartPie, "Investments", "Track holdings, allocation, and long-term growth."],
] as const;

const featureCards = [
  [IconBuildingBank, "Accounts", "See cash, credit, debt, and investment accounts in one organized view."],
  [IconArrowsExchange, "Transactions", "Review household activity with clear merchants, categories, and amounts."],
  [IconPigMoney, "Budgets", "Plan monthly categories and see what remains before spending gets away from you."],
  [IconChartPie, "Investments", "Understand holdings, allocation, performance, purchase lots, and projections."],
  [IconTargetArrow, "Goals", "Turn future plans into visible targets with measurable household progress."],
  [IconUsers, "Household", "Give the right people one shared financial picture without mixing households."],
] as const;

const setupSteps = [
  ["01", "Create your household", "Sign in securely and create the private workspace your records belong to."],
  ["02", "Add what matters", "Start with accounts, a monthly budget, goals, or the investments you already own."],
  ["03", "Review together", "Use the dashboard to see changes, priorities, and progress in one place."],
] as const;

const comparisonRows = [
  ["One household view instead of one spreadsheet per person", true, false],
  ["Budgets, accounts, goals, and investments in one workspace", true, false],
  ["Bank sync so balances stay current automatically", true, false],
  ["Built specifically for shared household finances", true, false],
  ["Someone has to remember to update it every week", false, true],
] as const;

const faqs = [
  {
    q: "Is BaerVault free right now?",
    a: "Yes. BaerVault is free while it's in early access. We'll be upfront before that ever changes.",
  },
  {
    q: "How does bank connection work?",
    a: "Account syncing runs through Plaid, the same connection layer used by most major finance apps. BaerVault never sees or stores your bank credentials.",
  },
  {
    q: "Can my partner or household see the same data?",
    a: "Yes — that's the point. Invite your household and everyone sees the same accounts, budget, and goals, isolated from every other household on BaerVault.",
  },
  {
    q: "Is my data actually private?",
    a: "Your household's records are isolated with Supabase row-level security and protected behind Clerk authentication with MFA support. See the Security section below.",
  },
  {
    q: "Do I have to connect a bank account to use it?",
    a: "No. You can track accounts, budgets, and goals manually, and connect a bank later if you want balances to update automatically.",
  },
  {
    q: "What happens to my data if I stop using BaerVault?",
    a: "It's yours. You can export or delete your household's records at any time from Settings.",
  },
] as const;

function DashboardPreview() {
  return (
    <div className={styles.previewWindow} aria-label="Preview of the BaerVault dashboard">
      <div className={styles.previewSidebar} aria-hidden="true">
        <span className={styles.previewMark}><IconLock size={14} /></span>
        <i className={styles.previewNavActive} />
        <i />
        <i />
        <i />
        <span className={styles.previewSidebarRule} />
        <i />
        <i />
      </div>
      <div className={styles.previewMain}>
        <div className={styles.previewTopbar}>
          <strong>Dashboard</strong>
          <span>Household overview</span>
        </div>
        <div className={styles.previewContent}>
          <section className={styles.spendingCard}>
            <div className={styles.previewCardHeading}>
              <strong>Monthly spending</strong>
              <span>Transactions</span>
            </div>
            <div className={styles.previewValue}>
              <strong>$2,184 left</strong>
              <span>$7,500 budgeted</span>
            </div>
            <svg viewBox="0 0 360 90" preserveAspectRatio="none" aria-hidden="true">
              <path className={styles.previewGuide} d="M4 78 L356 18" />
              <path className={styles.previewSpendingLine} d="M4 78 L120 76 L168 70 L210 48 L250 52 L302 29 L356 23" />
            </svg>
          </section>
          <section className={styles.worthCard}>
            <div className={styles.previewCardHeading}>
              <strong>Net worth</strong>
              <span>Accounts</span>
            </div>
            <div className={styles.worthValues}>
              <div><span>Assets</span><strong>$184,420</strong></div>
              <div><span>Debts</span><strong>$18,240</strong></div>
            </div>
            <svg viewBox="0 0 360 90" preserveAspectRatio="none" aria-hidden="true">
              <path className={styles.previewAssetLine} d="M4 60 L145 60 L210 56 L275 46 L356 25" />
              <path className={styles.previewDebtLine} d="M4 78 L155 78 L250 76 L356 73" />
            </svg>
          </section>
          <section className={styles.activityCard}>
            <div className={styles.previewCardHeading}>
              <strong>Transactions to review</strong>
              <span>View all</span>
            </div>
            {[
              ["City Market", "Groceries", "−$84.27"],
              ["Payroll", "Income", "+$3,120.00"],
              ["Electric Co.", "Utilities", "−$96.18"],
            ].map(([name, detail, value]) => (
              <div className={styles.previewRow} key={name}>
                <i />
                <span><strong>{name}</strong><small>{detail}</small></span>
                <b>{value}</b>
              </div>
            ))}
          </section>
          <section className={styles.categoriesCard}>
            <div className={styles.previewCardHeading}>
              <strong>Top categories</strong>
              <span>View all</span>
            </div>
            <div className={styles.categoryBar}><span>Home</span><i><b style={{ width: "78%" }} /></i><strong>$1,420</strong></div>
            <div className={styles.categoryBar}><span>Food</span><i><b style={{ width: "56%" }} /></i><strong>$816</strong></div>
            <div className={styles.categoryBar}><span>Travel</span><i><b style={{ width: "35%" }} /></i><strong>$392</strong></div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main className={styles.page}>
      <header className={styles.siteHeader}>
        <nav className={styles.nav} aria-label="Main navigation">
          <Link className={styles.brand} href="/" aria-label="BaerVault home">
            <BaerVaultLogo />
          </Link>
          <div className={styles.navLinks}>
            <a href="#product">Product</a>
            <a href="#pricing">Pricing</a>
            <a href="#faq">FAQ</a>
            <a href="#security">Security</a>
          </div>
          <div className={styles.navActions}>
            <Link className={styles.signIn} href="/sign-in">Sign in</Link>
            <Link className={styles.navCta} href="/sign-up">Create account</Link>
          </div>
        </nav>
      </header>

      <section className={styles.hero} id="product">
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>Household finance, clearly organized</p>
          <h1>Know where your household stands.</h1>
          <p className={styles.lede}>
            BaerVault brings spending, accounts, budgets, goals, and investments
            into one calm workspace built for your whole household.
          </p>
          <div className={styles.heroActions}>
            <TrackedLink className={styles.primaryAction} href="/sign-up" event="cta_click" eventProps={{ placement: "hero", label: "create_account" }}>
              Create your free account <IconArrowRight size={17} aria-hidden="true" />
            </TrackedLink>
            <TrackedLink className={styles.secondaryAction} href="/demo" event="cta_click" eventProps={{ placement: "hero", label: "explore_demo" }}>Explore the demo</TrackedLink>
            <Link className={styles.mobileSignInAction} href="/sign-in">Sign in</Link>
          </div>
          <p className={styles.securityNote}>
            <IconLock size={14} aria-hidden="true" /> Secure sign-in with Google and MFA
          </p>
        </div>
        <DashboardPreview />
      </section>

      <section className={styles.benefitStrip} aria-label="Why households use BaerVault">
        {benefits.map(({ icon: Icon, title, copy }) => (
          <div key={title}>
            <Icon size={18} aria-hidden="true" />
            <span><strong>{title}</strong><small>{copy}</small></span>
          </div>
        ))}
      </section>

      <section className={styles.factStrip} aria-label="BaerVault product coverage">
        <div><strong>9</strong><span>connected workspaces</span></div>
        <div><strong>1</strong><span>shared household view</span></div>
        <div><strong>Light + dark</strong><span>theme support</span></div>
        <div><strong>Desktop + mobile</strong><span>responsive layouts</span></div>
      </section>

      <section className={styles.productSection} aria-labelledby="product-heading">
        <div className={styles.sectionCopy}>
          <p>Everything has a clear place</p>
          <h2 id="product-heading">A complete financial picture without the clutter.</h2>
          <span>
            Each workspace answers one understandable question, while the
            dashboard connects everything into a useful household overview.
          </span>
          <div className={styles.productList}>
            {productAreas.map(([Icon, title, copy]) => (
              <div key={title}>
                <Icon size={19} aria-hidden="true" />
                <span><strong>{title}</strong><small>{copy}</small></span>
                <IconCheck className={styles.checkIcon} size={17} aria-hidden="true" />
              </div>
            ))}
          </div>
        </div>

        <div className={styles.accountPreview} aria-label="Example household accounts">
          <div className={styles.accountHeading}>
            <span><IconBuildingBank size={18} aria-hidden="true" /><strong>Accounts</strong></span>
            <small>Net worth</small>
          </div>
          <div className={styles.accountTotal}>
            <span>Household total</span>
            <strong>$166,180.00</strong>
            <small>Updated today</small>
          </div>
          {[
            ["Household checking", "Cash", "$8,420.00"],
            ["Emergency savings", "Cash", "$12,600.00"],
            ["Joint brokerage", "Investments", "$37,817.00"],
            ["Home loan", "Debt", "−$18,240.00"],
          ].map(([name, type, value]) => (
            <div className={styles.accountRow} key={name}>
              <i />
              <span><strong>{name}</strong><small>{type}</small></span>
              <b>{value}</b>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.featuresSection} aria-labelledby="features-heading">
        <div className={styles.sectionHeading}>
          <p>One system, clearly divided</p>
          <h2 id="features-heading">Every important part of the household picture.</h2>
          <span>Each area has a specific purpose, consistent controls, and a direct path back to the overview.</span>
        </div>
        <div className={styles.featureGrid}>
          {featureCards.map(([Icon, title, copy]) => (
            <article key={title}>
              <Icon size={20} aria-hidden="true" />
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.howSection} id="how" aria-labelledby="how-heading">
        <div className={styles.sectionHeading}>
          <p>How it works</p>
          <h2 id="how-heading">From setup to a useful household routine.</h2>
        </div>
        <div className={styles.stepGrid}>
          {setupSteps.map(([number, title, copy]) => (
            <article key={number}>
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.comparisonSection} aria-labelledby="comparison-heading">
        <div className={styles.sectionHeading}>
          <p>Why not just a spreadsheet</p>
          <h2 id="comparison-heading">Built for a household, not one person&apos;s habit.</h2>
        </div>
        <div className={styles.comparisonTable} role="table">
          <div className={styles.comparisonHead} role="row">
            <span role="columnheader" />
            <span role="columnheader">BaerVault</span>
            <span role="columnheader">A shared spreadsheet</span>
          </div>
          {comparisonRows.map(([label, hasIt, spreadsheetHasIt]) => (
            <div className={styles.comparisonRow} role="row" key={label}>
              <span role="cell">{label}</span>
              <span role="cell" className={styles.comparisonCell}>
                {hasIt ? <IconCheck size={16} className={styles.checkIcon} aria-hidden="true" /> : <IconMinus size={16} aria-hidden="true" />}
              </span>
              <span role="cell" className={styles.comparisonCell}>
                {spreadsheetHasIt ? <IconCheck size={16} className={styles.checkIcon} aria-hidden="true" /> : <IconMinus size={16} aria-hidden="true" />}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.pricingSection} id="pricing" aria-labelledby="pricing-heading">
        <div className={styles.sectionHeading}>
          <p>Pricing</p>
          <h2 id="pricing-heading">Free while BaerVault is in early access.</h2>
          <span>No trial countdown, no card required. We will tell you plainly before that ever changes.</span>
        </div>
        <div className={styles.pricingCard}>
          <div className={styles.pricingCardHead}>
            <span>Early access</span>
            <strong>$0</strong>
            <small>per household, for now</small>
          </div>
          <ul className={styles.pricingList}>
            {[
              "Unlimited accounts, budgets, and goals",
              "Shared household workspace",
              "Bank sync via Plaid",
              "Investment tracking",
              "Light and dark themes",
            ].map((item) => (
              <li key={item}><IconCheck size={16} className={styles.checkIcon} aria-hidden="true" /> {item}</li>
            ))}
          </ul>
          <TrackedLink className={styles.primaryAction} href="/sign-up" event="cta_click" eventProps={{ placement: "pricing", label: "create_account" }}>
            Create your free account <IconArrowRight size={17} aria-hidden="true" />
          </TrackedLink>
        </div>
      </section>

      <section className={styles.faqSection} id="faq" aria-labelledby="faq-heading">
        <div className={styles.sectionHeading}>
          <p>Questions</p>
          <h2 id="faq-heading">Before you connect anything.</h2>
        </div>
        <div className={styles.faqList}>
          {faqs.map(({ q, a }) => (
            <details className={styles.faqItem} key={q}>
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className={styles.securitySection} id="security" aria-labelledby="security-heading">
        <div>
          <IconShieldCheck size={24} aria-hidden="true" />
          <span>
            <p>Shared without becoming exposed</p>
            <h2 id="security-heading">Your household is the security boundary.</h2>
          </span>
        </div>
        <div className={styles.securityList}>
          <div><IconKey size={18} aria-hidden="true" /><span><strong>Protected identity</strong><small>Clerk handles secure sign-in, MFA, and membership.</small></span></div>
          <div><IconDatabase size={18} aria-hidden="true" /><span><strong>Household-isolated records</strong><small>Supabase row-level security keeps data in the correct household.</small></span></div>
          <div><IconWallet size={18} aria-hidden="true" /><span><strong>Clear ownership</strong><small>Market services provide prices; BaerVault stores what your household owns.</small></span></div>
        </div>
      </section>

      <section className={styles.finalCta}>
        <div>
          <p>Start with a clearer view</p>
          <h2>Bring your household finances into one place.</h2>
        </div>
        <div>
          <TrackedLink className={styles.primaryAction} href="/sign-up" event="cta_click" eventProps={{ placement: "final_cta", label: "create_account" }}>
            Create account <IconArrowRight size={17} aria-hidden="true" />
          </TrackedLink>
          <TrackedLink className={styles.secondaryAction} href="/demo" event="cta_click" eventProps={{ placement: "final_cta", label: "try_demo" }}>Try the demo first</TrackedLink>
        </div>
      </section>

      <footer className={styles.footer}>
        <BaerVaultLogo />
        <span>A calm, shared home for household finances.</span>
      </footer>
    </main>
  );
}
