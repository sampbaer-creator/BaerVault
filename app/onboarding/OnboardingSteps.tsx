"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { IconBuildingBank, IconPlus, IconTrash } from "@tabler/icons-react";
import { BankConnectionButton } from "@/features/accounts/BankConnectionButton";
import { addCategoryAction, updateBudgetCategoryAction } from "@/features/budgets/actions";
import type { MonthSelection } from "@/lib/helpers/monthSelection";
import styles from "./setup.module.css";

type CategoryDraft = { id?: string; key: string; name: string; plannedAmount: string };
const suggested: CategoryDraft[] = [
  { key: "housing", name: "Housing", plannedAmount: "1500" },
  { key: "groceries", name: "Groceries", plannedAmount: "600" },
  { key: "utilities", name: "Utilities", plannedAmount: "250" },
  { key: "transport", name: "Transportation", plannedAmount: "300" },
  { key: "dining", name: "Dining", plannedAmount: "200" },
];

export function OnboardingSteps({ step, period, existingCategories }: { step: "bank" | "budget"; period: MonthSelection; existingCategories: Array<{ id: string; name: string; plannedAmount: number }> }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<CategoryDraft[]>(existingCategories.length ? existingCategories.map(({ id, name, plannedAmount }) => ({ id, key: id, name, plannedAmount: String(plannedAmount) })) : suggested);
  const goToBudget = () => router.push("/onboarding?step=budget");
  async function saveBudgets(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true); setError("");
    const names = categories.map(({ name }) => name.trim().toLocaleLowerCase());
    if (new Set(names).size !== names.length) { setError("Each category needs a unique name."); setSaving(false); return; }
    for (const category of categories) {
      const amount = Number(category.plannedAmount);
      if (!category.name.trim() || !Number.isFinite(amount) || amount < 0) { setError("Enter a name and a valid amount for each category."); setSaving(false); return; }
      if (category.id) {
        const result = await updateBudgetCategoryAction(category.id, category.name, amount);
        if (!result.ok) { setError(result.error); setSaving(false); return; }
      } else {
        const result = await addCategoryAction({ year: period.year, month: period.month, name: category.name, plannedAmount: amount });
        if (!result.ok) { setError(result.error); setSaving(false); return; }
        setCategories((current) => current.map((item) => item.key === category.key ? { ...item, id: result.data.id } : item));
      }
    }
    setSaving(false);
    router.push("/dashboard");
    router.refresh();
  }
  return <main className={styles.page}><section className={styles.card}>
    <div className={styles.progress} aria-label={`Step ${step === "bank" ? 2 : 3} of 3`}><span>Household</span><i /><span className={step === "bank" ? styles.active : styles.done}>Connect bank</span><i /><span className={step === "budget" ? styles.active : ""}>Budget</span></div>
    {step === "bank" ? <>
      <div className={styles.icon}><IconBuildingBank size={24} aria-hidden="true" /></div>
      <p className={styles.eyebrow}>Step 2 of 3</p><h1>Connect a bank</h1>
      <p className={styles.intro}>Connect an account to bring in your transactions and see your real spending. You can also do this later.</p>
      {message && <p className={styles.stepMessage} role="status">{message}</p>}
      <div className={styles.stepActions}><BankConnectionButton className={styles.primaryAction} onMessage={(text, success) => { setMessage(text); if (success) goToBudget(); }} /><button type="button" className={styles.secondaryAction} onClick={goToBudget}>Skip for now</button></div>
    </> : <>
      <p className={styles.eyebrow}>Step 3 of 3</p><h1>Set up your budget</h1>
      <p className={styles.intro}>Start with these common categories. Adjust the amounts for your household, add more, or remove any you don&apos;t need.</p>
      <form className={styles.budgetForm} onSubmit={saveBudgets}>
        {categories.map((category) => <div className={styles.budgetRow} key={category.key}>
          <label>Category<input aria-label="Category name" maxLength={80} required value={category.name} onChange={(event) => setCategories((current) => current.map((item) => item.key === category.key ? { ...item, name: event.target.value } : item))} /></label>
          <label>Monthly amount<input aria-label={`${category.name} monthly amount`} type="number" inputMode="decimal" min="0" step="0.01" required value={category.plannedAmount} onChange={(event) => setCategories((current) => current.map((item) => item.key === category.key ? { ...item, plannedAmount: event.target.value } : item))} /></label>
          <button type="button" aria-label={`Remove ${category.name}`} onClick={() => setCategories((current) => current.filter((item) => item.key !== category.key))}><IconTrash size={17} aria-hidden="true" /></button>
        </div>)}
        <button type="button" className={styles.addCategory} onClick={() => setCategories((current) => [...current, { key: crypto.randomUUID(), name: "", plannedAmount: "0" }])}><IconPlus size={17} aria-hidden="true" /> Add category</button>
        {error && <p className={styles.stepError} role="alert">{error}</p>}
        <button className={styles.primaryAction} type="submit" disabled={saving}>{saving ? "Saving…" : "Finish and go to Home"}</button>
      </form>
      <Link className={styles.laterLink} href="/dashboard">Set up my budget later</Link>
    </>}
  </section></main>;
}
