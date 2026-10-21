"use client";

import { Drawer } from "@mantine/core";
import Link from "next/link";
import { useMediaQuery } from "@mantine/hooks";
import { type FormEvent } from "react";
import styles from "./QuickAddSheet.module.css";

export type QuickPurchaseDraft = { amount: string; categoryId: string; accountId: string; date: string; description: string };

type Option = { id: string; label: string };

export function QuickAddSheet({ opened, onClose, onSubmit, draft, onChange, categories, accounts, secondary, busy, error, editing = false }: {
  opened: boolean;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  draft: QuickPurchaseDraft;
  onChange: (draft: QuickPurchaseDraft) => void;
  categories: Option[];
  accounts: Option[];
  secondary: Array<{ label: string; href: string }>;
  busy: boolean;
  error: string;
  editing?: boolean;
}) {
  const mobile = useMediaQuery("(max-width: 47.999rem)");
  return <Drawer opened={opened} onClose={onClose} position={mobile ? "bottom" : "right"} size={mobile ? "auto" : 440} title={editing ? "Edit purchase" : "Add purchase"} classNames={{ content: styles.drawer, body: styles.body }}>
    <form className={styles.form} onSubmit={onSubmit}>
      {error && <p role="alert" className={styles.error}>{error}</p>}
      <label className={styles.titleField}><input aria-label="What did you buy?" type="text" maxLength={160} placeholder="What did you buy?" required value={draft.description} onChange={(event) => onChange({ ...draft, description: event.target.value })} /></label>
      <label>Amount <input aria-label="Purchase amount" type="number" inputMode="decimal" min="0.01" step="0.01" placeholder="0.00" required autoFocus value={draft.amount} onChange={(event) => onChange({ ...draft, amount: event.target.value })} /></label>
      <div className={styles.fieldGroup}><div className={styles.fieldLabel}><span>Category</span><span>{draft.categoryId ? "1 selected" : "Choose one"}</span></div><div className={styles.categoryChips} role="group" aria-label="Purchase category">{categories.length === 0 && <span className={styles.hint}>Add a budget category before logging a purchase.</span>}{categories.map(({ id, label }) => <button key={id} type="button" className={draft.categoryId === id || (!draft.categoryId && id === categories[0]?.id) ? styles.categoryChipActive : styles.categoryChip} onClick={() => onChange({ ...draft, categoryId: id })}>{label}</button>)}</div></div>
      <label>Account <select value={draft.accountId} onChange={(event) => onChange({ ...draft, accountId: event.target.value })}><option value="">{accounts.length ? "No account" : "No accounts yet"}</option>{accounts.map(({ id, label }) => <option key={id} value={id}>{label}</option>)}</select></label>
      <label>Date <span className={styles.dateRow}><input type="date" required value={draft.date} onChange={(event) => onChange({ ...draft, date: event.target.value })} /><button type="button" onClick={() => onChange({ ...draft, date: new Date().toISOString().slice(0, 10) })}>Today</button></span></label>
      <button className={styles.save} type="submit" disabled={busy || categories.length === 0}>{busy ? "Saving…" : editing ? "Save purchase" : "Add purchase"}</button>
      {categories.length === 0 && <p className={styles.hint}>Add a budget category before logging a purchase.</p>}
    </form>
    <div className={styles.other}><strong>Other actions</strong><div>{secondary.map(({ label, href }) => <Link key={label} href={href}>{label}</Link>)}</div></div>
  </Drawer>;
}
