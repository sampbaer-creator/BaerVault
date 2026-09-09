"use client";

import { IconCheck, IconCalendarRepeat } from "@tabler/icons-react";
import { useCurrencyFormatter } from "@/components/preferences/PreferencesProvider";
import { type BudgetMonth } from "@/lib/finance";
import type { UpcomingPayment } from "@/lib/recurring";
import styles from "./RecurringWorkspace.module.css";

export function RecurringWorkspace({ month, upcoming = [] }: { month: BudgetMonth; upcoming?: UpcomingPayment[] }) {
  const money = useCurrencyFormatter();
  const today = new Date().toISOString().slice(0, 10);
  const items = month.categories.flatMap((category) => category.purchases.map((purchase) => ({ ...purchase, category: category.name }))).filter((item) => item.date <= today).sort((a, b) => b.date.localeCompare(a.date));
  const paid = items.reduce((sum, item) => sum + item.amount, 0);
  const remaining = upcoming.reduce((sum, item) => sum + item.amount, 0);
  return <div className={styles.page}>
    <section className={styles.summary}>
      <div><strong>{money.format(remaining)}</strong><span>upcoming · includes estimates</span></div>
      <div className={styles.ring}><IconCalendarRepeat size={30} aria-hidden="true" /></div>
      <div><strong>{money.format(paid)}</strong><span>recorded so far</span></div>
    </section>
    <div className={styles.heading}><h2>Upcoming payments</h2><span>{upcoming.length} expected</span></div>
    {upcoming.length ? <section className={styles.grid} aria-label="Upcoming payments">{upcoming.map((item) => <article key={item.id}>
      <span className={styles.icon}><IconCalendarRepeat size={20} aria-hidden="true" /></span>
      <h3>{item.name}</h3><strong>{money.format(item.amount)}</strong>
      <span>{item.date} · {item.estimated ? "Estimated from three months of history" : "Scheduled"}</span>
    </article>)}</section> : <section className={styles.empty}><h3>No upcoming payments found</h3><p>Record a future payment in Budgets, or connect your bank. Monthly estimates appear after three consistent payments.</p></section>}
    <div className={styles.heading}><h2>Recorded payments</h2><span>{items.length} recorded</span></div>
    {items.length ? <section className={styles.grid} aria-label="Recorded payments">{items.map((item) => <article key={item.id}>
      <span className={styles.icon}><IconCalendarRepeat size={20} aria-hidden="true" /></span><IconCheck className={styles.check} size={17} aria-hidden="true" />
      <h3>{item.description}</h3><strong>{money.format(item.amount)}</strong>
      <span>{item.date} · {item.category}</span>
    </article>)}</section> : <section className={styles.empty}><h3>No payments recorded this month</h3><p>Add purchases in Budgets to get started.</p></section>}
  </div>;
}
