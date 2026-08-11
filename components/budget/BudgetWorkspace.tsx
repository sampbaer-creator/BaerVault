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

import {
  categoryActual,
  categoryRemaining,
  compactCurrency,
  currency,
  netCashFlow,
  totalIncome,
  totalPlanned,
  totalSpending,
  type BudgetCategory,
  type Purchase,
} from "@/lib/finance";
import { augustBudget } from "@/lib/mockFinanceData";

import styles from "./BudgetWorkspace.module.css";

type PurchaseDraft = { amount: string; description: string; date: string };
const emptyPurchase: PurchaseDraft = { amount: "", description: "", date: "2026-08-11" };

export function BudgetWorkspace() {
  const isMobile = useMediaQuery("(max-width: 47.999rem)");
  const [categories, setCategories] = useState<BudgetCategory[]>(augustBudget.categories);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [purchaseDraft, setPurchaseDraft] = useState<PurchaseDraft>(emptyPurchase);
  const [editingPurchaseId, setEditingPurchaseId] = useState<string | null>(null);
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);
  const [plannedDraft, setPlannedDraft] = useState("");
  const [editingPlanned, setEditingPlanned] = useState(false);
  const [addingCategory, setAddingCategory] = useState(false);
  const [categoryDraft, setCategoryDraft] = useState({ name: "", plannedAmount: "" });

  const month = useMemo(() => ({ ...augustBudget, categories }), [categories]);
  const selected = categories.find((category) => category.id === selectedId) ?? null;
  const income = totalIncome(month);
  const planned = totalPlanned(month);
  const spending = totalSpending(month);
  const remaining = planned - spending;
  const savings = netCashFlow(month);

  function openCategory(category: BudgetCategory) {
    setSelectedId(category.id);
    setPlannedDraft(category.plannedAmount.toString());
    setEditingPlanned(false);
    setShowPurchaseForm(false);
    setEditingPurchaseId(null);
    setPurchaseDraft(emptyPurchase);
  }

  function updateSelected(updater: (category: BudgetCategory) => BudgetCategory) {
    setCategories((current) => current.map((category) => category.id === selectedId ? updater(category) : category));
  }

  function submitPurchase(event: FormEvent) {
    event.preventDefault();
    const amount = Number(purchaseDraft.amount);
    if (!selected || !amount || amount < 0 || !purchaseDraft.description.trim()) return;
    updateSelected((category) => ({
      ...category,
      purchases: editingPurchaseId
        ? category.purchases.map((purchase) => purchase.id === editingPurchaseId ? { ...purchase, amount, description: purchaseDraft.description.trim(), date: purchaseDraft.date } : purchase)
        : [{ id: `purchase-${Date.now()}`, amount, description: purchaseDraft.description.trim(), date: purchaseDraft.date }, ...category.purchases],
    }));
    setPurchaseDraft(emptyPurchase);
    setEditingPurchaseId(null);
    setShowPurchaseForm(false);
  }

  function editPurchase(purchase: Purchase) {
    setPurchaseDraft({ amount: purchase.amount.toString(), description: purchase.description, date: purchase.date });
    setEditingPurchaseId(purchase.id);
    setShowPurchaseForm(true);
  }

  function removePurchase(id: string) {
    updateSelected((category) => ({ ...category, purchases: category.purchases.filter((purchase) => purchase.id !== id) }));
  }

  function savePlanned() {
    const value = Number(plannedDraft);
    if (value >= 0) updateSelected((category) => ({ ...category, plannedAmount: value }));
    setEditingPlanned(false);
  }

  function addCategory(event: FormEvent) {
    event.preventDefault();
    const plannedAmount = Number(categoryDraft.plannedAmount);
    if (!categoryDraft.name.trim() || plannedAmount < 0) return;
    setCategories((current) => [...current, { id: `category-${Date.now()}`, name: categoryDraft.name.trim(), plannedAmount, purchases: [] }]);
    setCategoryDraft({ name: "", plannedAmount: "" });
    setAddingCategory(false);
  }

  return (
    <div className={styles.budget}>
      <header className={styles.intro}>
        <div><p className={styles.eyebrow}>Monthly plan</p><h2>August budget</h2><p>Plan the month, then add purchases where they belong.</p></div>
        <button className={styles.copyButton} type="button" disabled title="Available when another month has been created"><IconCopy size={16} />Copy previous month</button>
      </header>

      <section className={styles.monthBar} aria-label="Budget month navigation">
        <button type="button" aria-label="Previous month" disabled title="Only August mock data is available"><IconArrowLeft size={18} /></button>
        <strong>August 2026</strong>
        <button type="button" aria-label="Next month" disabled title="Only August mock data is available"><IconArrowRight size={18} /></button>
      </section>

      <section className={styles.summary} aria-labelledby="budget-summary-title">
        <div className={styles.summaryLead}><span id="budget-summary-title">Available after spending</span><strong>{currency.format(savings)}</strong><small>{currency.format(income)} income this month</small></div>
        <div className={styles.summaryRail}>
          <div><span>Planned</span><strong>{currency.format(planned)}</strong></div>
          <div><span>Actual</span><strong>{currency.format(spending)}</strong></div>
          <div><span>Budget remaining</span><strong>{currency.format(remaining)}</strong></div>
        </div>
      </section>

      <section className={styles.sheet} aria-labelledby="categories-title">
        <div className={styles.sheetHeading}><div><h3 id="categories-title">Spending plan</h3><p>Actuals are calculated from the purchases inside each category.</p></div><button type="button" onClick={() => setAddingCategory(true)}><IconPlus size={16} />Add category</button></div>
        <div className={styles.tableHeader} aria-hidden="true"><span>Category</span><span>Budget / projected</span><span>Actual</span><span>Remaining / variance</span><span /></div>
        <div className={styles.rows}>
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

      <Drawer opened={Boolean(selected)} onClose={() => setSelectedId(null)} position={isMobile ? "bottom" : "right"} size={isMobile ? "88%" : 440} radius={isMobile ? "18px 18px 0 0" : 0} title={selected?.name} classNames={{ content: styles.drawer, header: styles.drawerHeader, body: styles.drawerBody, title: styles.drawerTitle }}>
        {selected && <div className={styles.categoryDetail}>
          <div className={styles.detailTotals}>
            <div><span>Budget</span>{editingPlanned ? <div className={styles.inlineEdit}><span>$</span><input aria-label="Planned budget amount" inputMode="decimal" value={plannedDraft} onChange={(e) => setPlannedDraft(e.target.value)} autoFocus /><button type="button" onClick={savePlanned} aria-label="Save planned amount"><IconCheck size={17} /></button></div> : <button type="button" onClick={() => setEditingPlanned(true)}>{currency.format(selected.plannedAmount)}<IconEdit size={14} /></button>}</div>
            <div><span>Actual</span><strong>{currency.format(categoryActual(selected))}</strong></div>
            <div><span>Remaining</span><strong className={categoryRemaining(selected) < 0 ? styles.over : ""}>{currency.format(categoryRemaining(selected))}</strong></div>
          </div>

          <div className={styles.purchaseHeading}><div><IconReceipt size={17} /><h3>Purchases</h3></div><button type="button" onClick={() => { setShowPurchaseForm(true); setEditingPurchaseId(null); setPurchaseDraft(emptyPurchase); }}><IconPlus size={15} />Add purchase</button></div>
          {showPurchaseForm && <form className={styles.purchaseForm} onSubmit={submitPurchase}>
            <div className={styles.amountField}><span>$</span><input aria-label="Purchase amount" placeholder="0.00" inputMode="decimal" min="0.01" step="0.01" required value={purchaseDraft.amount} onChange={(e) => setPurchaseDraft({ ...purchaseDraft, amount: e.target.value })} autoFocus /></div>
            <label>Description<input placeholder="Costco" required value={purchaseDraft.description} onChange={(e) => setPurchaseDraft({ ...purchaseDraft, description: e.target.value })} /></label>
            <label>Date<input type="date" required value={purchaseDraft.date} onChange={(e) => setPurchaseDraft({ ...purchaseDraft, date: e.target.value })} /></label>
            <div className={styles.formActions}><button type="button" onClick={() => setShowPurchaseForm(false)}><IconX size={15} />Cancel</button><button className={styles.primaryButton} type="submit">{editingPurchaseId ? "Save purchase" : "Add purchase"}</button></div>
          </form>}
          <div className={styles.purchaseList}>
            {selected.purchases.map((purchase) => <div className={styles.purchase} key={purchase.id}><div><strong>{purchase.description}</strong><span>{new Date(`${purchase.date}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span></div><strong>{currency.format(purchase.amount)}</strong><div className={styles.purchaseActions}><button type="button" onClick={() => editPurchase(purchase)} aria-label={`Edit ${purchase.description}`}><IconEdit size={16} /></button><button type="button" onClick={() => removePurchase(purchase.id)} aria-label={`Delete ${purchase.description}`}><IconTrash size={16} /></button></div></div>)}
          </div>
        </div>}
      </Drawer>

      <Drawer opened={addingCategory} onClose={() => setAddingCategory(false)} position={isMobile ? "bottom" : "right"} size={isMobile ? "auto" : 400} radius={isMobile ? "18px 18px 0 0" : 0} title="Add category" classNames={{ content: styles.drawer, header: styles.drawerHeader, body: styles.drawerBody, title: styles.drawerTitle }}>
        <form className={styles.categoryForm} onSubmit={addCategory}><label>Category name<input placeholder="Childcare" value={categoryDraft.name} onChange={(e) => setCategoryDraft({ ...categoryDraft, name: e.target.value })} autoFocus /></label><label>Planned amount<div className={styles.simpleAmount}><span>$</span><input inputMode="decimal" placeholder="0.00" value={categoryDraft.plannedAmount} onChange={(e) => setCategoryDraft({ ...categoryDraft, plannedAmount: e.target.value })} /></div></label><button className={styles.primaryButton} type="submit">Add category</button></form>
      </Drawer>
    </div>
  );
}
