import { IconCheck, IconCalendarRepeat } from "@tabler/icons-react";
import { currency, totalSpending, type BudgetMonth } from "@/lib/finance";
import styles from "./RecurringWorkspace.module.css";

export function RecurringWorkspace({ month }: { month: BudgetMonth }) {
  const items = month.categories.flatMap((category) => category.purchases.map((purchase) => ({ ...purchase, category: category.name }))).sort((a,b)=>a.date.localeCompare(b.date));
  const paid = totalSpending(month);
  return <div className={styles.page}>
    <section className={styles.summary}>
      <div><strong>{currency.format(0)}</strong><span>left to pay</span></div>
      <div className={styles.ring}><IconCheck size={30}/></div>
      <div><strong>{currency.format(paid)}</strong><span>paid so far</span></div>
    </section>
    <div className={styles.heading}><h2>This month</h2><span>{items.length} recorded</span></div>
    {items.length ? <section className={styles.grid} aria-label="This month's recorded payments">{items.map((item)=><article key={item.id}>
      <span className={styles.icon}><IconCalendarRepeat size={20}/></span><IconCheck className={styles.check} size={17}/>
      <h3>{item.description}</h3><strong>{currency.format(item.amount)}</strong>
      <span>{new Date(`${item.date}T12:00:00`).toLocaleDateString(undefined,{day:"numeric",month:"short"})} · {item.category}</span>
    </article>)}</section> : <section className={styles.empty}><IconCalendarRepeat size={28}/><h3>No payments recorded this month</h3><p>Add purchases in Budgets and they will appear here.</p></section>}
  </div>;
}
