"use client";

import { Drawer } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { IconArrowDown, IconArrowUp, IconEdit, IconPlus, IconTrash } from "@tabler/icons-react";
import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { deleteIncomeAction, saveIncomeAction } from "@/app/(app)/transactions/actions";
import { useCurrencyFormatter } from "@/components/preferences/PreferencesProvider";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { totalSpending, type BudgetMonth } from "@/lib/finance";
import styles from "./TransactionsWorkspace.module.css";

type Filter = "all" | "income" | "expenses";
const freshDraft = () => ({ source: "", amount: "", date: new Date().toISOString().slice(0, 10), owner: "Household" });

export function TransactionsWorkspace({ initialMonth }: { initialMonth: BudgetMonth }) {
  const money = useCurrencyFormatter();
  const mobile = useMediaQuery("(max-width: 47.999rem)");
  const pathname = usePathname();
  const budgetPath = pathname.startsWith("/demo") ? "/demo/budget" : "/budget";
  const [incomeEntries, setIncomeEntries] = useState(initialMonth.incomeEntries);
  const [filter, setFilter] = useState<Filter>("all");
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState(freshDraft);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const income = incomeEntries.reduce((sum, entry) => sum + entry.amount, 0);
  const spending = totalSpending(initialMonth);
  const accountSpending = useMemo(() => {
    const totals = new Map<string, number>();
    for (const category of initialMonth.categories) {
      for (const purchase of category.purchases) {
        const account = purchase.accountName ?? "Account not assigned";
        totals.set(account, (totals.get(account) ?? 0) + purchase.amount);
      }
    }
    return [...totals.entries()]
      .map(([account, amount]) => ({ account, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [initialMonth.categories]);
  const largestAccountSpend = accountSpending[0]?.amount ?? 0;
  const items = useMemo(() => [...incomeEntries.map((entry) => ({ id: entry.id, name: entry.source, category: "Income", account: entry.owner, date: entry.date, amount: entry.amount, incoming: true })), ...initialMonth.categories.flatMap((category) => category.purchases.map((purchase) => ({ id: purchase.id, name: purchase.description, category: category.name, account: purchase.accountName ?? "Account not assigned", date: purchase.date, amount: purchase.amount, incoming: false })))].filter((item) => filter === "all" || (filter === "income" ? item.incoming : !item.incoming)).sort((a, b) => b.date.localeCompare(a.date)), [filter, incomeEntries, initialMonth.categories]);

  function launch(id?: string) {
    const entry = incomeEntries.find((item) => item.id === id);
    setEditingId(entry?.id ?? null);
    setDraft(entry ? { source: entry.source, amount: String(entry.amount), date: entry.date, owner: entry.owner } : freshDraft());
    setError(""); setOpen(true);
  }
  async function save(event: FormEvent) {
    event.preventDefault(); setSaving(true); setError("");
    const result = await saveIncomeAction({ id: editingId ?? undefined, description: draft.source, amount: Number(draft.amount), date: draft.date, ownerLabel: draft.owner });
    setSaving(false);
    if (!result.ok) { setError(result.error); return; }
    setIncomeEntries((current) => editingId ? current.map((entry) => entry.id === editingId ? result.data : entry) : [result.data, ...current]);
    setOpen(false);
  }
  async function remove() {
    if (!pendingDelete) return;
    const result = await deleteIncomeAction(pendingDelete);
    if (!result.ok) { setError(result.error); setPendingDelete(null); return; }
    setIncomeEntries((current) => current.filter((entry) => entry.id !== pendingDelete)); setPendingDelete(null);
  }

  return <div className={styles.page}>
    <header className={styles.intro}><div><span>Household activity</span><h2>Every dollar, in one ledger.</h2><p>Income entered here also updates your Budget and Dashboard totals.</p></div><button className="btn btn-primary" onClick={() => launch()}><IconPlus size={16}/>Add income</button></header>
    <div className={styles.summary}><Summary label="Money in" value={`+${money.format(income)}`} positive/><Summary label="Money out" value={`−${money.format(spending)}`} negative/><Summary label="Net" value={money.format(income-spending)}/></div>
    <section className={`${styles.accountChart} chart-summary card`} aria-labelledby="account-spending-title">
      <div className={styles.chartHeading}>
        <div><span>Spending by account</span><h3 id="account-spending-title">Where this month&apos;s money came from</h3></div>
        <strong>{money.format(spending)}</strong>
      </div>
      {accountSpending.length ? <div className={styles.accountBars}>
        {accountSpending.map((item) => <div className={styles.accountBarRow} key={item.account}>
          <span>{item.account}</span>
          <div className={styles.accountTrack} aria-hidden="true"><i style={{ width: `${largestAccountSpend ? (item.amount / largestAccountSpend) * 100 : 0}%` }} /></div>
          <strong>{money.format(item.amount)}</strong>
        </div>)}
      </div> : <p className={styles.emptyChart}>Add a budget purchase to see account spending here.</p>}
    </section>
    <div className={styles.mobileActions} aria-label="Add transaction"><button type="button" onClick={() => launch()}><IconArrowDown size={17}/>Add income</button><Link href={budgetPath}><IconArrowUp size={17}/>Add expense</Link></div>
    <section className={`${styles.panel} table-wrapper card`}><div className={styles.tabs}>{(["all","income","expenses"] as Filter[]).map((value) => <button className={filter === value ? styles.active : ""} key={value} onClick={() => setFilter(value)}>{value[0].toUpperCase()+value.slice(1)}</button>)}<span>{items.length} transactions</span></div><table><thead><tr><th>Merchant</th><th>Category</th><th>Account</th><th>Date</th><th>Amount</th><th/></tr></thead><tbody>{items.map((item) => <tr key={item.id}><td><div className={styles.merchant}><i>{item.name.slice(0,1)}</i><strong>{item.name}</strong></div></td><td><span className={styles.chip}><i style={{background:item.incoming?"var(--money-positive)":"var(--chart-secondary)"}}/>{item.category}</span></td><td className={styles.muted}>{item.account}</td><td className={styles.muted}>{item.date}</td><td className={item.incoming?styles.positive:styles.negative}><strong>{item.incoming?"+":"−"}{money.format(item.amount)}</strong></td><td>{item.incoming&&<div className={styles.actions}><button aria-label={`Edit ${item.name}`} onClick={() => launch(item.id)}><IconEdit size={15}/></button><button aria-label={`Delete ${item.name}`} onClick={() => setPendingDelete(item.id)}><IconTrash size={15}/></button></div>}</td></tr>)}</tbody></table></section>
    <Drawer opened={open} onClose={() => setOpen(false)} position={mobile?"bottom":"right"} size={mobile?"auto":430} title={editingId?"Edit income":"Add income"} classNames={{content:styles.drawer,header:styles.drawerHeader,body:styles.drawerBody,title:styles.drawerTitle}}><form className={styles.form} onSubmit={save}>{error&&<p className={styles.error}>{error}</p>}<label>Amount<div className={styles.moneyInput}><span>$</span><input type="number" min="0.01" step="0.01" required autoFocus value={draft.amount} onChange={(event) => setDraft({...draft,amount:event.target.value})} placeholder="0.00"/></div></label><label>Income source<input required maxLength={160} value={draft.source} onChange={(event) => setDraft({...draft,source:event.target.value})} placeholder="Payroll"/></label><div className={styles.formRow}><label>Date<input type="date" required value={draft.date} onChange={(event) => setDraft({...draft,date:event.target.value})}/></label><label>Owner<select value={draft.owner} onChange={(event) => setDraft({...draft,owner:event.target.value})}><option>Household</option><option>User</option><option>Spouse</option><option>Joint</option></select></label></div><button className={`${styles.submit} btn btn-primary`} disabled={saving}>{saving?"Saving…":editingId?"Save changes":"Add income"}</button></form></Drawer>
    <ConfirmDialog opened={Boolean(pendingDelete)} title="Delete this income entry?" description="This updates income totals everywhere in BearVault." confirmLabel="Delete income" onCancel={() => setPendingDelete(null)} onConfirm={() => { void remove(); }}/>
  </div>;
}
function Summary({label,value,positive,negative}:{label:string;value:string;positive?:boolean;negative?:boolean}) { return <div><span>{label}</span><strong className={positive?styles.positive:negative?styles.negative:""}>{value}</strong></div>; }
