"use client";

import { Drawer } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import {
  IconArrowLeft,
  IconArrowRight,
  IconCheck,
  IconChevronRight,
  IconCopy,
  IconEdit,
  IconPlus,
  IconReceipt,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import * as realActions from "@/app/(app)/budget/actions";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useCurrencyFormatter } from "@/components/preferences/PreferencesProvider";

import {
  categoryActual,
  categoryRemaining,
  compactCurrency,
  netCashFlow,
  totalIncome,
  totalPlanned,
  totalSpending,
  type BudgetCategory,
  type BudgetMonth,
  type Purchase,
} from "@/lib/finance";

import styles from "./BudgetWorkspace.module.css";

type BudgetAccountOption = {
  id: string;
  name: string;
  institution: string;
  type: string;
};

type PurchaseDraft = {
  amount: string;
  description: string;
  date: string;
  accountId: string;
};
const today = new Date().toISOString().slice(0, 10);
const emptyPurchase: PurchaseDraft = {
  amount: "",
  description: "",
  date: today,
  accountId: "",
};

type BudgetActions=Pick<typeof realActions,"addCategoryAction"|"deleteBudgetCategoryAction"|"deleteBudgetEntryAction"|"saveBudgetEntryAction"|"updateBudgetCategoryAction">;
export function BudgetWorkspace({ initialBudget, accounts = [], actions=realActions }: { initialBudget: BudgetMonth & { year: number; monthNumber: number }; accounts?: BudgetAccountOption[]; actions?:BudgetActions }) {
  const currency=useCurrencyFormatter();
  const router = useRouter();
  const pathname = usePathname();
  const accountsPath = pathname.startsWith("/demo") ? "/demo/accounts" : "/accounts";
  const isMobile = useMediaQuery("(max-width: 47.999rem)");
  const [categories, setCategories] = useState<BudgetCategory[]>(initialBudget.categories);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [purchaseDraft, setPurchaseDraft] = useState<PurchaseDraft>(emptyPurchase);
  const [editingPurchaseId, setEditingPurchaseId] = useState<string | null>(null);
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);
  const [plannedDraft, setPlannedDraft] = useState("");
  const [editingPlanned, setEditingPlanned] = useState(false);
  const [addingCategory, setAddingCategory] = useState(false);
  const [categoryDraft, setCategoryDraft] = useState({ name: "", plannedAmount: "" });
  const [categoryNameDraft, setCategoryNameDraft] = useState("");
  const [pendingDelete, setPendingDelete] = useState<{ kind: "entry" | "category"; id: string; label: string } | null>(null);

  const month = useMemo(() => ({ ...initialBudget, categories }), [categories, initialBudget]);
  const selected = categories.find((category) => category.id === selectedId) ?? null;
  const income = totalIncome(month);
  const planned = totalPlanned(month);
  const spending = totalSpending(month);
  const remaining = planned - spending;
  const savings = netCashFlow(month);

  function openMonth(offset: number) {
    const target = new Date(Date.UTC(initialBudget.year, initialBudget.monthNumber - 1 + offset, 1));
    const params = new URLSearchParams({
      year: String(target.getUTCFullYear()),
      month: String(target.getUTCMonth() + 1),
    });
    router.push(`${pathname}?${params.toString()}`);
  }

  function openCategory(category: BudgetCategory) {
    setSelectedId(category.id);
    setPlannedDraft(category.plannedAmount.toString());
    setCategoryNameDraft(category.name);
    setEditingPlanned(false);
    setShowPurchaseForm(false);
    setEditingPurchaseId(null);
    setPurchaseDraft(emptyPurchase);
  }

  function updateSelected(updater: (category: BudgetCategory) => BudgetCategory) {
    setCategories((current) => current.map((category) => category.id === selectedId ? updater(category) : category));
  }

  async function submitPurchase(event: FormEvent) {
    event.preventDefault();
    const amount = Number(purchaseDraft.amount);
    if (!selected || !amount || amount < 0 || !purchaseDraft.description.trim()) return;
    const previous = categories;
    const temporaryId = editingPurchaseId ?? "pending-new-entry";
    const accountId = purchaseDraft.accountId || null;
    const accountName = accounts.find((account) => account.id === accountId)?.name ?? null;
    updateSelected((category) => ({
      ...category,
      purchases: editingPurchaseId
        ? category.purchases.map((purchase) => purchase.id === editingPurchaseId ? { ...purchase, amount, description: purchaseDraft.description.trim(), date: purchaseDraft.date, accountId, accountName } : purchase)
        : [{ id: temporaryId, amount, description: purchaseDraft.description.trim(), date: purchaseDraft.date, accountId, accountName }, ...category.purchases],
    }));
    setSaving(true); setError("");
    const result = await actions.saveBudgetEntryAction({ id: editingPurchaseId ?? undefined, categoryId: selected.id, description: purchaseDraft.description, amount, date: purchaseDraft.date, accountId });
    setSaving(false);
    if (!result.ok) { setCategories(previous); setError(result.error); return; }
    if (!editingPurchaseId) setCategories((current) => current.map((category) => category.id === selected.id ? { ...category, purchases: category.purchases.map((purchase) => purchase.id === temporaryId ? { ...purchase, id: result.data.id } : purchase) } : category));
    setPurchaseDraft(emptyPurchase);
    setEditingPurchaseId(null);
    setShowPurchaseForm(false);
    router.refresh();
  }

  function editPurchase(purchase: Purchase) {
    setPurchaseDraft({ amount: purchase.amount.toString(), description: purchase.description, date: purchase.date, accountId: purchase.accountId ?? "" });
    setEditingPurchaseId(purchase.id);
    setShowPurchaseForm(true);
  }

  async function savePlanned() {
    const value = Number(plannedDraft);
    if (value >= 0 && selected) {
      const previous = categories; updateSelected((category) => ({ ...category, plannedAmount: value }));
      const result = await actions.updateBudgetCategoryAction(selected.id, categoryNameDraft, value);
      if (!result.ok) { setCategories(previous); setError(result.error); } else router.refresh();
    }
    setEditingPlanned(false);
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    setSaving(true); setError("");
    const result = pendingDelete.kind === "entry" ? await actions.deleteBudgetEntryAction(pendingDelete.id) : await actions.deleteBudgetCategoryAction(pendingDelete.id);
    setSaving(false);
    if (!result.ok) { setError(result.error); return; }
    if (pendingDelete.kind === "entry") setCategories((current) => current.map((category) => ({ ...category, purchases: category.purchases.filter((purchase) => purchase.id !== pendingDelete.id) })));
    else { setCategories((current) => current.filter((category) => category.id !== pendingDelete.id)); setSelectedId(null); }
    setPendingDelete(null); router.refresh();
  }

  async function addCategory(event: FormEvent) {
    event.preventDefault();
    const plannedAmount = Number(categoryDraft.plannedAmount);
    if (!categoryDraft.name.trim() || plannedAmount < 0) return;
    setSaving(true); setError("");
    const result = await actions.addCategoryAction({ year: initialBudget.year, month: initialBudget.monthNumber, name: categoryDraft.name, plannedAmount });
    setSaving(false);
    if (!result.ok) { setError(result.error); return; }
    setCategories((current) => [...current, result.data]);
    setCategoryDraft({ name: "", plannedAmount: "" });
    setAddingCategory(false);
    router.refresh();
  }

  return (
    <div className={styles.budget}>
      <header className={styles.intro}>
        <div><p className={styles.eyebrow}>Monthly plan</p><h2>{initialBudget.month} budget</h2><p>Plan the month, then add purchases where they belong.</p></div>
        <button className={styles.copyButton} type="button" disabled title="Available when another month has been created"><IconCopy size={16} />Copy previous month</button>
      </header>

      <section className={styles.monthBar} aria-label="Budget month navigation">
        <button type="button" aria-label="Previous month" onClick={() => openMonth(-1)}><IconArrowLeft size={18} /></button>
        <strong>{initialBudget.month}</strong>
        <button type="button" aria-label="Next month" onClick={() => openMonth(1)}><IconArrowRight size={18} /></button>
      </section>

      {error && <p className={styles.formError} role="alert">{error}</p>}

      <section className={styles.summary} aria-labelledby="budget-summary-title">
        <div className={styles.summaryLead}><span id="budget-summary-title">Available after spending</span><strong>{currency.format(savings)}</strong><small>{currency.format(income)} income this month</small></div>
        <div className={styles.summaryRail}>
          <div><span>Planned</span><strong>{currency.format(planned)}</strong></div>
          <div><span>Actual</span><strong>{currency.format(spending)}</strong></div>
          <div><span>Budget remaining</span><strong>{currency.format(remaining)}</strong></div>
        </div>
      </section>

      <div className={styles.referenceGrid}>
      <section className={styles.sheet} aria-labelledby="categories-title">
        <div className={styles.sheetHeading}><div><h3 id="categories-title">Spending plan</h3><p>Actuals are calculated from the purchases inside each category.</p></div><button type="button" onClick={() => setAddingCategory(true)}><IconPlus size={16} />Add category</button></div>
        <div className={styles.tableHeader} aria-hidden="true"><span>Category</span><span>Budget / projected</span><span>Actual</span><span>Remaining / variance</span><span /></div>
        <div className={styles.rows}>
          {!categories.length && <div className={styles.emptyState}>No budget categories yet. Add your first category to start planning this month.</div>}
          {categories.map((category) => {
            const actual = categoryActual(category);
            const variance = categoryRemaining(category);
            const percent = category.plannedAmount ? Math.min((actual / category.plannedAmount) * 100, 100) : 0;
            return <button className={styles.categoryRow} type="button" onClick={() => openCategory(category)} aria-haspopup="dialog" aria-expanded={selectedId === category.id} key={category.id}>
              <span className={styles.categoryName}><strong>{category.name}</strong><small>{category.purchases.length} {category.purchases.length === 1 ? "purchase" : "purchases"}</small></span>
              <span className={styles.desktopValue}>{currency.format(category.plannedAmount)}</span>
              <span className={styles.desktopValue}>{currency.format(actual)}</span>
              <span className={`${styles.desktopValue} ${variance < 0 ? styles.over : ""}`}>{variance < 0 ? "−" : ""}{currency.format(Math.abs(variance))}</span>
              <span className={styles.mobileProgress}><span><strong>{currency.format(actual)}</strong> of {compactCurrency.format(category.plannedAmount)}</span><small className={variance < 0 ? styles.over : ""}>{variance < 0 ? `${currency.format(Math.abs(variance))} over` : `${currency.format(variance)} remaining`}</small><i role="progressbar" aria-label={`${category.name} budget used`} aria-valuemin={0} aria-valuemax={category.plannedAmount} aria-valuenow={actual}><b style={{ width: `${percent}%` }} /></i></span>
              <IconChevronRight className={styles.rowChevron} size={17} aria-hidden="true" />
            </button>;
          })}
        </div>
      </section>

      <aside className={styles.budgetAside}>
        <section className={styles.allocationPanel}><h3>Where it goes</h3><div className={styles.allocationRing} style={{ "--used": `${planned ? Math.min(spending / planned * 100, 100) : 0}%` } as React.CSSProperties}><div><strong>{currency.format(spending)}</strong><span>spent</span></div></div><div className={styles.allocationLegend}>{categories.slice(0, 4).map((category) => <div key={category.id}><i /><span>{category.name}</span><strong>{currency.format(categoryActual(category))}</strong></div>)}</div></section>
        <section className={styles.remainingPanel}><span>Left to spend</span><strong>{currency.format(remaining)}</strong><p>{remaining >= 0 ? "Your plan is on pace for this month." : "Review categories currently over budget."}</p></section>
      </aside>
      </div>

      <Drawer opened={Boolean(selected)} onClose={() => setSelectedId(null)} position={isMobile ? "bottom" : "right"} size={isMobile ? "88%" : 440} radius={isMobile ? "18px 18px 0 0" : 0} title={selected?.name} classNames={{ content: styles.drawer, header: styles.drawerHeader, body: styles.drawerBody, title: styles.drawerTitle }}>
        {selected && <div className={styles.categoryDetail}>
          <label className={styles.categoryForm}>Category name<input value={categoryNameDraft} onChange={(event)=>setCategoryNameDraft(event.target.value)} onBlur={savePlanned}/></label>
          <div className={styles.detailTotals}>
            <div><span>Budget</span>{editingPlanned ? <div className={styles.inlineEdit}><span>$</span><input aria-label="Planned budget amount" inputMode="decimal" value={plannedDraft} onChange={(e) => setPlannedDraft(e.target.value)} autoFocus /><button type="button" onClick={savePlanned} aria-label="Save planned amount"><IconCheck size={17} /></button></div> : <button type="button" onClick={() => setEditingPlanned(true)}>{currency.format(selected.plannedAmount)}<IconEdit size={14} /></button>}</div>
            <div><span>Actual</span><strong>{currency.format(categoryActual(selected))}</strong></div>
            <div><span>Remaining</span><strong className={categoryRemaining(selected) < 0 ? styles.over : ""}>{currency.format(categoryRemaining(selected))}</strong></div>
          </div>

          <div className={styles.purchaseHeading}><div><IconReceipt size={17} /><h3>Purchases</h3></div><button type="button" onClick={() => { setShowPurchaseForm(true); setEditingPurchaseId(null); setPurchaseDraft(emptyPurchase); }}><IconPlus size={15} />Add purchase</button></div>
          {showPurchaseForm && <form className={styles.purchaseForm} onSubmit={submitPurchase}>
            <div className={styles.amountField}><span>$</span><input aria-label="Purchase amount" placeholder="0.00" inputMode="decimal" min="0.01" step="0.01" required value={purchaseDraft.amount} onChange={(e) => setPurchaseDraft({ ...purchaseDraft, amount: e.target.value })} autoFocus /></div>
            <label>Description<input placeholder="Costco" required value={purchaseDraft.description} onChange={(e) => setPurchaseDraft({ ...purchaseDraft, description: e.target.value })} /></label>
            <label>Paid from<select required={accounts.length > 0} disabled={accounts.length === 0} value={purchaseDraft.accountId} onChange={(e) => setPurchaseDraft({ ...purchaseDraft, accountId: e.target.value })}><option value="">{accounts.length ? "Select an account" : "No accounts added yet"}</option>{accounts.map((account) => <option value={account.id} key={account.id}>{account.name}{account.institution ? ` · ${account.institution}` : ""}</option>)}</select></label>
            {accounts.length === 0 ? <p className={styles.accountHint}>Add checking, cash, or a credit card in <Link href={accountsPath}>Accounts</Link> to identify where purchases were paid from.</p> : null}
            <label>Date<input type="date" required value={purchaseDraft.date} onChange={(e) => setPurchaseDraft({ ...purchaseDraft, date: e.target.value })} /></label>
            <div className={styles.formActions}><button type="button" onClick={() => setShowPurchaseForm(false)}><IconX size={15} />Cancel</button><button className={styles.primaryButton} type="submit" disabled={saving}>{saving ? "Saving…" : editingPurchaseId ? "Save purchase" : "Add purchase"}</button></div>
          </form>}
          <div className={styles.purchaseList}>
            {selected.purchases.map((purchase) => <div className={styles.purchase} key={purchase.id}><div><strong>{purchase.description}</strong><span>{new Date(`${purchase.date}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" })} · {purchase.accountName ?? "Account not assigned"}</span></div><strong>{currency.format(purchase.amount)}</strong><div className={styles.purchaseActions}><button type="button" onClick={() => editPurchase(purchase)} aria-label={`Edit ${purchase.description}`}><IconEdit size={16} /></button><button type="button" onClick={() => setPendingDelete({kind:"entry",id:purchase.id,label:purchase.description})} aria-label={`Delete ${purchase.description}`}><IconTrash size={16} /></button></div></div>)}
          </div>
          <button className={styles.copyButton} type="button" onClick={()=>setPendingDelete({kind:"category",id:selected.id,label:selected.name})}><IconTrash size={15}/>Delete category</button>
        </div>}
      </Drawer>

      <Drawer opened={addingCategory} onClose={() => setAddingCategory(false)} position={isMobile ? "bottom" : "right"} size={isMobile ? "auto" : 400} radius={isMobile ? "18px 18px 0 0" : 0} title="Add category" classNames={{ content: styles.drawer, header: styles.drawerHeader, body: styles.drawerBody, title: styles.drawerTitle }}>
        <form className={styles.categoryForm} onSubmit={addCategory}><label>Category name<input placeholder="Childcare" value={categoryDraft.name} onChange={(e) => setCategoryDraft({ ...categoryDraft, name: e.target.value })} autoFocus /></label><label>Planned amount<div className={styles.simpleAmount}><span>$</span><input inputMode="decimal" placeholder="0.00" value={categoryDraft.plannedAmount} onChange={(e) => setCategoryDraft({ ...categoryDraft, plannedAmount: e.target.value })} /></div></label><button className={styles.primaryButton} type="submit" disabled={saving}>{saving ? "Saving…" : "Add category"}</button></form>
      </Drawer>
      <ConfirmDialog opened={Boolean(pendingDelete)} title={`Delete ${pendingDelete?.label ?? "record"}?`} description={pendingDelete?.kind==="category"?"This permanently deletes the category and every spending entry inside it.":"This permanently deletes this spending entry."} confirmLabel={pendingDelete?.kind==="category"?"Delete category":"Delete entry"} busy={saving} onCancel={()=>setPendingDelete(null)} onConfirm={confirmDelete}/>
    </div>
  );
}
