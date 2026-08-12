import { IconArrowRight, IconChartPie, IconHome, IconLock } from "@tabler/icons-react";
import Link from "next/link";

import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.page}>
      <nav className={styles.nav} aria-label="Main navigation">
        <Link className={styles.brand} href="/">
          <span className={styles.brandMark} aria-hidden="true"><IconHome size={19} /></span>
          BearVault
        </Link>
        <div className={styles.navActions}>
          <Link className={styles.signIn} href="/demo">Try demo</Link>
          <Link className={styles.signIn} href="/sign-in">Sign in</Link>
          <Link className={styles.navCta} href="/sign-up">Create account</Link>
        </div>
      </nav>

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>Household money, finally in one place</p>
          <h1>Build a calmer financial life together.</h1>
          <p className={styles.lede}>
            BearVault gives your household one clear view of spending, cash flow,
            budgets, and investments—without the spreadsheet sprawl.
          </p>
          <div className={styles.heroActions}>
            <Link className={styles.primaryCta} href="/sign-up">
              Create your free account <IconArrowRight size={18} />
            </Link>
            <Link className={styles.secondaryCta} href="/sign-in">I already have an account</Link>
            <Link className={styles.demoCta} href="/demo">Try demo</Link>
          </div>
          <p className={styles.securityNote}><IconLock size={15} /> Secure sign-in with Google and MFA</p>
        </div>

        <div className={styles.preview} aria-label="BearVault dashboard preview">
          <div className={styles.previewHeader}>
            <span className={styles.previewBrand}><IconChartPie size={18} /> Household overview</span>
            <span className={styles.livePill}>This month</span>
          </div>
          <div className={styles.balanceCard}>
            <span>Net worth</span>
            <strong>$184,420</strong>
            <small>↑ 4.8% this year</small>
          </div>
          <div className={styles.metrics}>
            <div><span>Income</span><strong>$9,240</strong></div>
            <div><span>Spent</span><strong>$5,816</strong></div>
            <div><span>Saved</span><strong>$3,424</strong></div>
          </div>
          <div className={styles.chart}>
            {[38, 54, 47, 68, 60, 82, 74, 92].map((height, index) => (
              <span key={index} style={{ height: `${height}%` }} />
            ))}
          </div>
        </div>
      </section>

      <section className={styles.trustStrip} aria-label="Product benefits">
        <div><strong>One shared view</strong><span>Keep everyone on the same page.</span></div>
        <div><strong>Private by design</strong><span>Your household data stays yours.</span></div>
        <div><strong>Ready in minutes</strong><span>Set up your household and start.</span></div>
      </section>
    </main>
  );
}
