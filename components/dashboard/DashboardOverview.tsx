import { IconArrowRight, IconBuildingBank, IconReceipt, IconShieldCheck } from "@tabler/icons-react";
import Link from "next/link";

import { categoryActual, currency, totalIncome, totalPlanned, totalSpending, type BudgetMonth } from "@/lib/finance";
import { costFor, type InvestmentAccount } from "@/lib/investmentData";
import styles from "./DashboardOverview.module.css";

function SectionHeading({ title, href, action, id }: { title: string; href: string; action: string; id: string }) {
  return <div className={styles.sectionHeading}><h3 id={id}>{title}</h3><Link className={styles.textLink} href={href}>{action}<IconArrowRight size={15}/></Link></div>;
}

export function DashboardOverview({ budget, accounts }: { budget: BudgetMonth; accounts: InvestmentAccount[] }) {
  const income = totalIncome(budget); const spending = totalSpending(budget); const planned = totalPlanned(budget);
  const invested = accounts.reduce((sum, account) => sum + account.holdings.reduce((total, holding) => total + costFor(holding), 0), 0);
  const entries = budget.categories.flatMap((category) => category.purchases.map((entry) => ({ ...entry, category: category.name }))).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  const isEmpty = !income && !spending && !planned && !accounts.length;

  return <div className={styles.dashboard}>
    <section className={styles.intro}><div><h2>Your household overview</h2><p>{isEmpty ? "Your vault is ready. Add your first budget, income entry, or investment account." : "Everything here comes from your household’s saved records."}</p></div><div className={styles.secureBadge}><IconShieldCheck size={17}/><span>Household protected</span></div></section>
    <section className={styles.netWorthSurface}><div className={styles.netWorthTopline}><div className={styles.netWorthCopy}><h3>Saved financial picture</h3><p className={styles.netWorthValue}>{currency.format(invested)}</p><div className={styles.netWorthChange}><span>Invested cost basis</span><span>Live market value is available in Investments</span></div></div></div><div className={styles.summaryRail}>
      <div className={styles.summaryStat}><span>Income</span><strong>{currency.format(income)}</strong><small>{budget.month}</small></div>
      <div className={styles.summaryStat}><span>Spending</span><strong>{currency.format(spending)}</strong><small>Derived from entries</small></div>
      <div className={styles.summaryStat}><span>Budget left</span><strong>{currency.format(planned - spending)}</strong><small>Planned minus actual</small></div>
      <div className={styles.summaryStat}><span>Accounts</span><strong>{accounts.length}</strong><small>{accounts.reduce((count, account) => count + account.holdings.length, 0)} holdings</small></div>
    </div></section>
    <div className={styles.detailGrid}>
      <section className={`${styles.panel} ${styles.budgetPanel}`}><SectionHeading id="budget-title" title={`${budget.month} budget`} href="/budget" action="Open budget"/><div className={styles.budgetLead}><div><span>Spent</span><strong>{currency.format(spending)}</strong></div><p><strong>{currency.format(planned - spending)}</strong> remaining of {currency.format(planned)}</p></div><div className={styles.budgetBar}><span style={{width:`${planned ? Math.min(spending / planned * 100, 100) : 0}%`}}/></div><div className={styles.budgetCategories}>{budget.categories.length ? budget.categories.slice(0, 4).map((category)=><div className={styles.budgetCategory} key={category.id}><div><span className={`${styles.categoryDot} ${styles.green}`}/><span>{category.name}</span></div><p><strong>{currency.format(categoryActual(category))}</strong> / {currency.format(category.plannedAmount)}</p></div>) : <p>No categories yet. Start by creating a monthly budget.</p>}</div></section>
      <section className={`${styles.panel} ${styles.investmentPanel}`}><SectionHeading id="investment-title" title="Investments" href="/investments" action="View portfolio"/><div className={styles.investmentLead}><div><span>Amount invested</span><strong>{currency.format(invested)}</strong></div></div><div className={styles.holdings}>{accounts.length ? accounts.map((account)=><div className={styles.holding} key={account.id}><span className={styles.symbol}><IconBuildingBank size={16}/></span><div className={styles.holdingName}>{account.name}</div><div className={styles.holdingValue}><strong>{account.holdings.length} holdings</strong><small>{account.owner}</small></div></div>) : <p>No investment accounts yet.</p>}</div></section>
      <section className={`${styles.panel} ${styles.transactionsPanel}`}><SectionHeading id="transactions-title" title="Recent spending" href="/cash-flow" action="View cash flow"/><div className={styles.transactions}>{entries.length ? entries.map((entry)=><div className={styles.transaction} key={entry.id}><span className={styles.transactionIcon}><IconReceipt size={18}/></span><div className={styles.transactionName}><strong>{entry.description}</strong><span>{entry.category} · {entry.date}</span></div><span className={styles.outgoing}>−{currency.format(entry.amount)}</span></div>) : <p>No spending entries yet.</p>}</div></section>
    </div>
  </div>;
}
