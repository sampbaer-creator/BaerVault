import {
  IconArrowRight,
  IconBuildingBank,
  IconChartPie,
  IconCheck,
  IconLock,
  IconPigMoney,
  IconReceipt,
  IconShieldCheck,
  IconTrendingUp,
  IconUsers,
} from "@tabler/icons-react";
import Link from "next/link";

import { BearVaultLogo } from "@/components/brand/BearVaultLogo";
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

function DashboardPreview() {
  return (
    <div className={styles.previewWindow} aria-label="Preview of the BearVault dashboard">
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
          <Link className={styles.brand} href="/" aria-label="BearVault home">
            <BearVaultLogo />
          </Link>
          <div className={styles.navLinks}>
            <a href="#product">Product</a>
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
            BearVault brings spending, accounts, budgets, goals, and investments
            into one calm workspace built for your whole household.
          </p>
          <div className={styles.heroActions}>
            <Link className={styles.primaryAction} href="/sign-up">
              Create your free account <IconArrowRight size={17} aria-hidden="true" />
            </Link>
            <Link className={styles.secondaryAction} href="/demo">Explore the demo</Link>
          </div>
          <p className={styles.securityNote}>
            <IconLock size={14} aria-hidden="true" /> Secure sign-in with Google and MFA
          </p>
        </div>
        <DashboardPreview />
      </section>

      <section className={styles.benefitStrip} aria-label="Why households use BearVault">
        {benefits.map(({ icon: Icon, title, copy }) => (
          <div key={title}>
            <Icon size={18} aria-hidden="true" />
            <span><strong>{title}</strong><small>{copy}</small></span>
          </div>
        ))}
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

      <section className={styles.securitySection} id="security" aria-labelledby="security-heading">
        <div>
          <IconShieldCheck size={24} aria-hidden="true" />
          <span>
            <p>Shared without becoming exposed</p>
            <h2 id="security-heading">Your household is the security boundary.</h2>
          </span>
        </div>
        <p>
          Clerk protects identity and household membership. Supabase row-level
          security keeps financial records inside the correct household.
        </p>
      </section>

      <section className={styles.finalCta}>
        <div>
          <p>Start with a clearer view</p>
          <h2>Bring your household finances into one place.</h2>
        </div>
        <div>
          <Link className={styles.primaryAction} href="/sign-up">
            Create account <IconArrowRight size={17} aria-hidden="true" />
          </Link>
          <Link className={styles.secondaryAction} href="/demo">Try the demo first</Link>
        </div>
      </section>

      <footer className={styles.footer}>
        <BearVaultLogo />
        <span>A calm, shared home for household finances.</span>
      </footer>
    </main>
  );
}
