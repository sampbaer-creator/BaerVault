import Link from "next/link";
import { IconArrowRight, IconArrowsExchange, IconBuildingBank, IconChartPie, IconCheck, IconPigMoney, IconShieldLock, IconTargetArrow, IconUsers } from "@tabler/icons-react";
import { BaerVaultLogo } from "@/components/brand/BaerVaultLogo";
import { TrackedLink } from "@/components/shared/TrackedLink";
import styles from "./page.module.css";

const features = [
  [IconBuildingBank, "Accounts", "Review balances, bank connection status, and transfers."],
  [IconArrowsExchange, "Transactions", "Find and edit recorded income and spending in a shared ledger."],
  [IconPigMoney, "Budgets", "Plan categories and compare spending with the amounts you set."],
  [IconChartPie, "Investments", "Review holdings, purchase costs, and available market quotes."],
  [IconTargetArrow, "Goals", "Track recorded savings against household targets."],
  [IconUsers, "Household", "Manage the members who share your financial records."],
] as const;

const questions = [
  ["Do I need to connect a bank?", "No. Start with manual accounts and recorded transactions. You can connect a bank later."],
  ["What does my household share?", "Members of the active household share its accounts, transactions, budgets, holdings, and goals. Review member roles before inviting someone."],
  ["Are the dashboard amounts a spending allowance?", "No. The overview shows recorded balances and spending. Missing bills, stale balances, and unpriced investments can affect your picture."],
  ["Can I try it before signing in?", "Yes. The interactive demo uses sample records. Changes in the demo are temporary and are never saved to a household."],
] as const;

function DashboardPreview() {
  return <div className={styles.previewWindow} aria-label="Sample household overview">
    <div className={styles.previewTopbar}><strong>Household overview</strong><span>Sample data</span></div>
    <div className={styles.previewContent}>
      <section className={styles.worthCard}>
        <span>Net worth</span><strong className={styles.previewAmount}>$53,210.41</strong>
        <div className={styles.worthValues}><div><span>Assets</span><strong>$53,762.71</strong></div><div><span>Debts</span><strong>$552.30</strong></div></div>
        <p>Account balances and sample investment values.</p>
      </section>
      <section className={styles.spendingCard}>
        <h2>This month&apos;s budget</h2><strong>$940.44 remaining</strong>
        <div className={styles.budgetTrack} aria-hidden="true"><i /></div>
        <div className={styles.worthValues}><div><span>Spent</span><strong>$3,309.56</strong></div><div><span>Planned</span><strong>$4,250.00</strong></div></div>
      </section>
      <section className={styles.activityCard}>
        <h2>Recent activity</h2>
        {[["Payroll", "Income", "+$1,846.15"], ["Costco", "Groceries", "-$126.42"], ["Copper Onion", "Dining", "-$68.40"]].map(([name, category, amount]) =>
          <div className={styles.previewRow} key={name}><span><strong>{name}</strong><small>{category}</small></span><b>{amount}</b></div>)}
      </section>
    </div>
  </div>;
}

export default function Home() {
  return <main className={styles.page}>
    <a className={styles.skipLink} href="#product">Skip to main content</a>
    <header className={styles.siteHeader}>
      <nav className={styles.nav} aria-label="Main navigation">
        <Link className={styles.brand} href="/" aria-label="BearVault home"><BaerVaultLogo /></Link>
        <div className={styles.navLinks}><a href="#features">Product</a><a href="#pricing">Pricing</a><a href="#faq">Questions</a></div>
        <div className={styles.navActions}><Link className={styles.signIn} href="/sign-in">Sign in</Link><Link className={styles.navCta} href="/sign-up">Create account</Link></div>
      </nav>
    </header>
    <section className={styles.hero} id="product">
      <div className={styles.heroCopy}>
        <h1>Know where your household stands.</h1>
        <p className={styles.lede}>Your accounts, spending, budgets, and goals in one shared place. A clear picture for your next money decision.</p>
        <div className={styles.heroActions}>
          <TrackedLink className={styles.primaryAction} href="/sign-up" event="cta_click" eventProps={{ placement: "hero", label: "create_account" }}>Create your household<IconArrowRight size={18} aria-hidden="true" /></TrackedLink>
          <TrackedLink className={styles.secondaryAction} href="/demo" event="cta_click" eventProps={{ placement: "hero", label: "explore_demo" }}>Explore the demo</TrackedLink>
        </div>
        <p className={styles.securityNote}>Start manually. Connect a bank when you&apos;re ready.</p>
      </div>
      <DashboardPreview />
    </section>
    <section className={styles.featuresSection} id="features" aria-labelledby="features-heading">
      <div className={styles.sectionHeading}><h2 id="features-heading">A clear place for each part of your finances.</h2><p>Review the overview, then go straight to the records behind it.</p></div>
      <div className={styles.featureGrid}>{features.map(([Icon, title, copy]) => <article key={title}><Icon size={22} aria-hidden="true" /><h3>{title}</h3><p>{copy}</p></article>)}</div>
    </section>
    <section className={styles.howSection} aria-labelledby="how-heading">
      <div className={styles.sectionHeading}><h2 id="how-heading">Start with the records you already have.</h2></div>
      <ol className={styles.stepGrid}>
        <li><h3>Create a household</h3><p>Sign in and choose the household your records belong to.</p></li>
        <li><h3>Add your accounts</h3><p>Record a balance manually or connect an available bank.</p></li>
        <li><h3>Plan and review together</h3><p>Set a budget, record spending, and check your progress.</p></li>
      </ol>
    </section>
    <section className={styles.pricingSection} id="pricing" aria-labelledby="pricing-heading">
      <div className={styles.sectionHeading}><h2 id="pricing-heading">Free during early access.</h2><p>Start with the demo or create a household. No payment card is required.</p></div>
      <div className={styles.pricingCard}>
        <div><span>Early access</span><strong>$0</strong><small>per household, for now</small></div>
        <ul>{["Shared accounts and ledger", "Budgets and savings goals", "Investment tracking", "Manual entry or bank connection"].map(item => <li key={item}><IconCheck size={18} aria-hidden="true" />{item}</li>)}</ul>
        <TrackedLink className={styles.primaryAction} href="/sign-up" event="cta_click" eventProps={{ placement: "pricing", label: "create_account" }}>Create account<IconArrowRight size={18} aria-hidden="true" /></TrackedLink>
      </div>
    </section>
    <section className={styles.faqSection} id="faq" aria-labelledby="faq-heading">
      <div className={styles.sectionHeading}><h2 id="faq-heading">Before you connect anything.</h2></div>
      <div className={styles.faqList}>{questions.map(([question, answer]) => <details className={styles.faqItem} key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div>
    </section>
    <section className={styles.securitySection} id="security" aria-labelledby="sharing-heading">
      <IconShieldLock size={28} aria-hidden="true" /><div><h2 id="sharing-heading">Share with your household deliberately.</h2><p>Members share the same financial records. Manage invitations and roles from Household, and account sign-in settings from Settings.</p></div>
    </section>
    <footer className={styles.footer}><BaerVaultLogo /><span>A calm, shared home for household finances.</span><Link href="/demo">Try the demo</Link></footer>
  </main>;
}
