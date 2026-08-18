"use client";

import { Drawer } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { IconArrowDown, IconArrowUp, IconCheck, IconEdit, IconPlus, IconSearch, IconTrash } from "@tabler/icons-react";
import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { deleteIncomeAction, saveIncomeAction } from "@/app/(app)/transactions/actions";
import { deleteBudgetEntryAction, saveBudgetEntryAction } from "@/app/(app)/budget/actions";
import { useCurrencyFormatter } from "@/components/preferences/PreferencesProvider";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { SwipeActionRow } from "@/components/shared/SwipeActionRow";
import { type BudgetMonth } from "@/lib/finance";
import styles from "./TransactionsWorkspace.module.css";
import { invalidateMobileShell } from "@/lib/mobileShell";

type Filter = "all" | "income" | "expenses";
const freshDraft = () => ({ source: "", amount: "", date: new Date().toISOString().slice(0, 10), owner: "Household" });

export function TransactionsWorkspace({ initialMonth }: { initialMonth: BudgetMonth }) {
  const money = useCurrencyFormatter();
  const mobile = useMediaQuery("(max-width: 47.999rem)");
  const pathname = usePathname();
  const budgetPath = pathname.startsWith("/demo") ? "/demo/budget" : "/budget";
  const [incomeEntries, setIncomeEntries] = useState(initialMonth.incomeEntries);
  const [expenseEntries, setExpenseEntries] = useState(() => initialMonth.categories.flatMap((category) => category.purchases.map((purchase) => ({ ...purchase, categoryId: category.id, category: category.name }))));
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState(freshDraft);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [pendingDelete, setPendingDelete] = useState<{id:string;name:string;incoming:boolean} | null>(null);
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [expenseDraft, setExpenseDraft] = useState({ id:"", categoryId:"", description:"", amount:"", date:"", accountId:null as string | null });
  const income = incomeEntries.reduce((sum, entry) => sum + entry.amount, 0);
  const spending = expenseEntries.reduce((sum, entry) => sum + entry.amount, 0);
  const accountSpending = useMemo(() => {
    const totals = new Map<string, number>();
    for (const purchase of expenseEntries) {
      const account = purchase.accountName ?? "Account not assigned";
      totals.set(account, (totals.get(account) ?? 0) + purchase.amount);
    }
    return [...totals.entries()]
      .map(([account, amount]) => ({ account, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [expenseEntries]);
  const largestAccountSpend = accountSpending[0]?.amount ?? 0;
  const items = useMemo(() => [...incomeEntries.map((entry) => ({ id: entry.id, name: entry.source, category: "Income", account: entry.owner, date: entry.date, amount: entry.amount, incoming: true as const })), ...expenseEntries.map((purchase) => ({ ...purchase, name: purchase.description, account: purchase.accountName ?? "Account not assigned", incoming: false as const }))].filter((item) => filter === "all" || (filter === "income" ? item.incoming : !item.incoming)).sort((a, b) => b.date.localeCompare(a.date)), [filter, incomeEntries, expenseEntries]);
  const visibleItems = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return normalized ? items.filter((item) => `${item.name} ${item.category} ${item.account}`.toLowerCase().includes(normalized)) : items;
  }, [items, query]);
  const mobileGroups = useMemo(() => {
    const groups = new Map<string, typeof visibleItems>();
    visibleItems.forEach((item) => groups.set(item.date, [...(groups.get(item.date) ?? []), item]));
    return [...groups.entries()];
  }, [visibleItems]);

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
    invalidateMobileShell();
  }
  function editExpense(id: string) {
    const entry = expenseEntries.find((item) => item.id === id);
    if (!entry) return;
    setExpenseDraft({ id:entry.id, categoryId:entry.categoryId, description:entry.description, amount:String(entry.amount), date:entry.date, accountId:entry.accountId ?? null });
    setError(""); setExpenseOpen(true);
  }
  async function saveExpense(event: FormEvent) {
    event.preventDefault();
    const amount = Number(expenseDraft.amount);
    setSaving(true); setError("");
    if (!pathname.startsWith("/demo")) {
      const result = await saveBudgetEntryAction({ id:expenseDraft.id, categoryId:expenseDraft.categoryId, description:expenseDraft.description, amount, date:expenseDraft.date, accountId:expenseDraft.accountId });
      if (!result.ok) { setSaving(false); setError(result.error); return; }
    }
    setExpenseEntries((current) => current.map((entry) => entry.id === expenseDraft.id ? {...entry,description:expenseDraft.description.trim(),amount,date:expenseDraft.date} : entry));
    setSaving(false); setExpenseOpen(false);
    if (!pathname.startsWith("/demo")) invalidateMobileShell();
  }
  async function remove() {
    if (!pendingDelete) return;
    if (!pathname.startsWith("/demo")) {
      const result = pendingDelete.incoming ? await deleteIncomeAction(pendingDelete.id) : await deleteBudgetEntryAction(pendingDelete.id);
      if (!result.ok) { setError(result.error); setPendingDelete(null); return; }
    }
    if (pendingDelete.incoming) setIncomeEntries((current) => current.filter((entry) => entry.id !== pendingDelete.id));
    else setExpenseEntries((current) => current.filter((entry) => entry.id !== pendingDelete.id));
    setPendingDelete(null);
    if (!pathname.startsWith("/demo")) invalidateMobileShell();
  }

  return <div className={styles.page}>
    <div className={styles.mobileSearch}><IconSearch size={23} aria-hidden="true"/><input value={query} onChange={(event)=>setQuery(event.target.value)} placeholder="Search" aria-label="Search transactions"/><button type="button" aria-label={`Filter transactions: ${filter}`} aria-expanded={filterOpen} aria-controls="transaction-filter-menu" onClick={()=>setFilterOpen((open)=>!open)}><Image src="/transaction-filter.png" alt="" width={22} height={22}/></button>{filterOpen&&<div className={styles.mobileFilterMenu} id="transaction-filter-menu" role="menu">{(["all","income","expenses"] as Filter[]).map((value)=><button type="button" role="menuitemradio" aria-checked={filter===value} key={value} onClick={()=>{setFilter(value);setFilterOpen(false)}}><span>{value==="all"?"All transactions":value==="income"?"Income":"Expenses"}</span>{filter===value&&<IconCheck size={17} aria-hidden="true"/>}</button>)}</div>}</div>
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
          <div className={styles.accountTrack} aria-hidden="true"><i data-animate-progress style={{ width: `${largestAccountSpend ? (item.amount / largestAccountSpend) * 100 : 0}%` }} /></div>
          <strong>{money.format(item.amount)}</strong>
        </div>)}
      </div> : <p className={styles.emptyChart}>Add a budget purchase to see account spending here.</p>}
    </section>
    <div className={styles.mobileActions} aria-label="Add transaction"><button type="button" onClick={() => launch()}><IconArrowDown size={17}/>Add income</button><Link href={budgetPath}><IconArrowUp size={17}/>Add expense</Link></div>
    <section className={`${styles.panel} table-wrapper card`}><div className={styles.tabs}>{(["all","income","expenses"] as Filter[]).map((value) => <button className={filter === value ? styles.active : ""} key={value} onClick={() => setFilter(value)}>{value[0].toUpperCase()+value.slice(1)}</button>)}<span>{visibleItems.length} transactions</span></div><table><thead><tr><th>Merchant</th><th>Category</th><th>Account</th><th>Date</th><th>Amount</th><th/></tr></thead><tbody>{visibleItems.map((item) => <tr key={item.id}><td><div className={styles.merchant}><i>{item.name.slice(0,1)}</i><strong>{item.name}</strong></div></td><td><span className={styles.chip}><i style={{background:item.incoming?"var(--money-positive)":"var(--chart-secondary)"}}/>{item.category}</span></td><td className={styles.muted}>{item.account}</td><td className={styles.muted}>{item.date}</td><td className={item.incoming?styles.positive:styles.negative}><strong>{item.incoming?"+":"−"}{money.format(item.amount)}</strong></td><td>{item.incoming&&<div className={styles.actions}><button aria-label={`Edit ${item.name}`} onClick={() => launch(item.id)}><IconEdit size={15}/></button><button aria-label={`Delete ${item.name}`} onClick={() => setPendingDelete({id:item.id,name:item.name,incoming:true})}><IconTrash size={15}/></button></div>}</td></tr>)}</tbody></table>
      <div className={styles.mobileLedger}>{mobileGroups.map(([date,group])=><section className={styles.mobileDateGroup} key={date}><h3>{new Date(`${date}T12:00:00`).toLocaleDateString(undefined,{weekday:"short",month:"long",day:"numeric"})}</h3>{group.map((item)=><SwipeActionRow key={item.id} onEdit={()=>item.incoming?launch(item.id):editExpense(item.id)} onDelete={()=>setPendingDelete({id:item.id,name:item.name,incoming:item.incoming})}><button type="button" className={styles.mobileTransaction} onClick={()=>item.incoming?launch(item.id):editExpense(item.id)}><strong>{item.name}</strong><span>{item.category}</span><b className={item.incoming?styles.positive:undefined}>{item.incoming?"+":""}{money.format(item.amount)}</b></button></SwipeActionRow>)}</section>)}</div>
    </section>
    <Drawer opened={open} onClose={() => setOpen(false)} position={mobile?"bottom":"right"} size={mobile?"auto":430} title={editingId?"Edit income":"Add income"} classNames={{content:styles.drawer,header:styles.drawerHeader,body:styles.drawerBody,title:styles.drawerTitle}}><form className={styles.form} onSubmit={save}>{error&&<p className={styles.error}>{error}</p>}<label>Amount<div className={styles.moneyInput}><span>$</span><input type="number" min="0.01" step="0.01" required autoFocus value={draft.amount} onChange={(event) => setDraft({...draft,amount:event.target.value})} placeholder="0.00"/></div></label><label>Income source<input required maxLength={160} value={draft.source} onChange={(event) => setDraft({...draft,source:event.target.value})} placeholder="Payroll"/></label><div className={styles.formRow}><label>Date<input type="date" required value={draft.date} onChange={(event) => setDraft({...draft,date:event.target.value})}/></label><label>Owner<select value={draft.owner} onChange={(event) => setDraft({...draft,owner:event.target.value})}><option>Household</option><option>User</option><option>Spouse</option><option>Joint</option></select></label></div><button className={`${styles.submit} btn btn-primary`} disabled={saving}>{saving?"Saving…":editingId?"Save changes":"Add income"}</button></form></Drawer>
    <Drawer opened={expenseOpen} onClose={()=>setExpenseOpen(false)} position={mobile?"bottom":"right"} size={mobile?"auto":430} title="Edit expense" classNames={{content:styles.drawer,header:styles.drawerHeader,body:styles.drawerBody,title:styles.drawerTitle}}><form className={styles.form} onSubmit={saveExpense}>{error&&<p className={styles.error}>{error}</p>}<label>Amount<div className={styles.moneyInput}><span>$</span><input type="number" min="0.01" step="0.01" required autoFocus value={expenseDraft.amount} onChange={(event)=>setExpenseDraft({...expenseDraft,amount:event.target.value})}/></div></label><label>Description<input required maxLength={160} value={expenseDraft.description} onChange={(event)=>setExpenseDraft({...expenseDraft,description:event.target.value})}/></label><label>Date<input type="date" required value={expenseDraft.date} onChange={(event)=>setExpenseDraft({...expenseDraft,date:event.target.value})}/></label><button className={`${styles.submit} btn btn-primary`} disabled={saving}>{saving?"Saving…":"Save expense"}</button></form></Drawer>
    <ConfirmDialog opened={Boolean(pendingDelete)} title={`Delete ${pendingDelete?.name ?? "this transaction"}?`} description={pendingDelete?.incoming?"This updates income totals everywhere in BearVault.":"This permanently removes the expense from its budget category."} confirmLabel={pendingDelete?.incoming?"Delete income":"Delete expense"} onCancel={() => setPendingDelete(null)} onConfirm={() => { void remove(); }}/>
  </div>;
}
function Summary({label,value,positive,negative}:{label:string;value:string;positive?:boolean;negative?:boolean}) { return <div><span>{label}</span><strong className={positive?styles.positive:negative?styles.negative:""}>{value}</strong></div>; }
