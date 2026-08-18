"use client";

import { Drawer } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { IconEdit, IconPlus, IconTargetArrow, IconTrash } from "@tabler/icons-react";
import { FormEvent, useState } from "react";
import { addGoalAction, deleteGoalAction, updateGoalAction } from "@/app/(app)/goals/actions";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { currency } from "@/lib/finance";
import type { SavingsGoal } from "@/lib/goals";
import styles from "./GoalsWorkspace.module.css";
import { invalidateMobileShell } from "@/lib/mobileShell";

const emptyDraft = { name: "", targetAmount: "", savedAmount: "0", targetDate: "", monthlyContribution: "0" };
const colors = ["#4f8389", "#d4af37", "#000080", "#5e191a", "#cfac87", "#e8b00f"];

export function GoalsWorkspace({ initialGoals }: { initialGoals: SavingsGoal[] }) {
  const mobile = useMediaQuery("(max-width: 47.999rem)");
  const [goals, setGoals] = useState(initialGoals);
  const [editing, setEditing] = useState<SavingsGoal | null>(null);
  const [draft, setDraft] = useState(emptyDraft);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [pendingDelete, setPendingDelete] = useState<SavingsGoal | null>(null);
  const totalSaved = goals.reduce((sum, goal) => sum + goal.savedAmount, 0);
  const totalTarget = goals.reduce((sum, goal) => sum + goal.targetAmount, 0);

  function launch(goal?: SavingsGoal) {
    setEditing(goal ?? null);
    setDraft(goal ? { name: goal.name, targetAmount: String(goal.targetAmount), savedAmount: String(goal.savedAmount), targetDate: goal.targetDate ?? "", monthlyContribution: String(goal.monthlyContribution) } : emptyDraft);
    setError(""); setOpen(true);
  }
  async function save(event: FormEvent) {
    event.preventDefault(); setSaving(true); setError("");
    const input = { name: draft.name, targetAmount: Number(draft.targetAmount), savedAmount: Number(draft.savedAmount), targetDate: draft.targetDate || null, monthlyContribution: Number(draft.monthlyContribution) };
    const result = editing ? await updateGoalAction({ id: editing.id, ...input }) : await addGoalAction(input);
    setSaving(false);
    if (!result.ok) { setError(result.error); return; }
    setGoals((current) => editing ? current.map((goal) => goal.id === editing.id ? result.data : goal) : [...current, result.data]);
    setOpen(false);
    invalidateMobileShell();
  }
  async function remove() {
    if (!pendingDelete) return;
    const result = await deleteGoalAction(pendingDelete.id);
    if (!result.ok) { setError(result.error); setPendingDelete(null); return; }
    setGoals((current) => current.filter((goal) => goal.id !== pendingDelete.id)); setPendingDelete(null);
    invalidateMobileShell();
  }

  return <div className={styles.page}>
    <div className={styles.top}><div><span className={styles.eyebrow}>Household plan</span><h2>Goals that move with your life.</h2><p>Build, fund, and revise every savings target in one place.</p></div><button className={styles.add} onClick={() => launch()}><IconPlus size={17}/>Add goal</button></div>
    <div className={styles.mobileGoalSummary}>
      <div><strong>{currency.format(totalSaved)}</strong><span>saved toward goals</span></div>
      <i data-animate-ring-progress style={{ "--progress": totalTarget ? `${Math.min(100, totalSaved / totalTarget * 100)}%` : "0%" } as React.CSSProperties}><b>{totalTarget ? `${Math.round(totalSaved / totalTarget * 100)}%` : "—"}</b></i>
      <div><strong>{currency.format(Math.max(0, totalTarget - totalSaved))}</strong><span>left to save</span></div>
    </div>
    <div className={styles.metrics}><Metric label="Total saved" value={currency.format(totalSaved)} /><Metric label="Combined target" value={currency.format(totalTarget)} /><Metric label="Overall progress" value={totalTarget ? `${Math.round(totalSaved / totalTarget * 100)}%` : "—"} /></div>
    {goals.length ? <section className={styles.grid} aria-label="Savings goals">{goals.map((goal, index) => {
      const progress = Math.min(100, Math.round(goal.savedAmount / goal.targetAmount * 100));
      const remaining = Math.max(0, goal.targetAmount - goal.savedAmount);
      return <article className={styles.goal} key={goal.id}>
        <div className={styles.goalHead}><div className={styles.ring} data-animate-ring-progress style={{ "--progress": `${progress}%`, "--ring": colors[index % colors.length] } as React.CSSProperties}><strong>{progress}%</strong></div><div><h3>{goal.name}</h3><span>{goal.targetDate ? `Target ${new Date(`${goal.targetDate}T12:00:00`).toLocaleDateString(undefined, { month: "short", year: "numeric" })}` : "No deadline"}</span></div><button aria-label={`Edit ${goal.name}`} onClick={() => launch(goal)}><IconEdit size={16}/></button></div>
        <p className={styles.amount}>{currency.format(goal.savedAmount)}</p><span className={styles.detail}>of {currency.format(goal.targetAmount)} · {currency.format(remaining)} to go</span>
        <div className={styles.footer}><span>{currency.format(goal.monthlyContribution)}/mo</span><button onClick={() => setPendingDelete(goal)}><IconTrash size={15}/>Delete</button></div>
      </article>;
    })}</section> : <section className={styles.empty}><IconTargetArrow size={32}/><h3>Create your first goal</h3><p>Give your household something concrete to work toward.</p><button className={styles.add} onClick={() => launch()}><IconPlus size={17}/>Add goal</button></section>}
    <Drawer opened={open} onClose={() => setOpen(false)} position={mobile ? "bottom" : "right"} size={mobile ? "auto" : 430} title={editing ? "Edit goal" : "Add a goal"} classNames={{ content: styles.drawer, header: styles.drawerHeader, body: styles.drawerBody, title: styles.drawerTitle }}>
      <form className={styles.form} onSubmit={save}>{error && <p className={styles.error}>{error}</p>}<label>Goal name<input required maxLength={100} autoFocus value={draft.name} onChange={(e) => setDraft({...draft, name:e.target.value})} placeholder="Emergency fund"/></label><div className={styles.formRow}><label>Target amount<input required min="1" step="0.01" type="number" value={draft.targetAmount} onChange={(e) => setDraft({...draft,targetAmount:e.target.value})}/></label><label>Already saved<input required min="0" step="0.01" type="number" value={draft.savedAmount} onChange={(e) => setDraft({...draft,savedAmount:e.target.value})}/></label></div><div className={styles.formRow}><label>Target date<input type="date" value={draft.targetDate} onChange={(e) => setDraft({...draft,targetDate:e.target.value})}/></label><label>Monthly contribution<input required min="0" step="0.01" type="number" value={draft.monthlyContribution} onChange={(e) => setDraft({...draft,monthlyContribution:e.target.value})}/></label></div><button className={styles.submit} disabled={saving}>{saving ? "Saving…" : editing ? "Save changes" : "Create goal"}</button></form>
    </Drawer>
    <ConfirmDialog opened={Boolean(pendingDelete)} title="Delete this goal?" description={pendingDelete ? `${pendingDelete.name} and its progress will be permanently removed.` : ""} confirmLabel="Delete goal" onCancel={() => setPendingDelete(null)} onConfirm={() => { void remove(); }}/>
  </div>;
}
function Metric({label,value}:{label:string;value:string}) { return <div className={styles.metric}><span>{label}</span><strong>{value}</strong></div>; }
