"use client";

import { Drawer } from "@mantine/core";
import {
  IconBuildingBank,
  IconCash,
  IconChartLine,
  IconChevronRight,
  IconCreditCard,
  IconPencil,
  IconPigMoney,
  IconPlus,
  IconReceiptTax,
  IconShieldLock,
  IconTrash,
  IconWallet,
  IconX,
  type Icon,
} from "@tabler/icons-react";
import { type FormEvent, useRef, useState } from "react";

import {
  addFinancialAccountAction,
  deleteFinancialAccountAction,
  updateFinancialAccountAction,
} from "@/app/(app)/accounts/actions";
import { useCurrencyFormatter } from "@/components/preferences/PreferencesProvider";
import { SwipeActionRow } from "@/components/shared/SwipeActionRow";
import {
  financialAccountTypeLabels,
  financialAccountTypes,
  isDebtAccount,
  type FinancialAccount,
  type FinancialAccountDraft,
  type FinancialAccountType,
} from "@/lib/accounts";

import styles from "./AccountsWorkspace.module.css";

type AccountsWorkspaceProps = {
  initialAccounts: FinancialAccount[];
  demo?: boolean;
};

type FormState = {
  name: string;
  institution: string;
  type: FinancialAccountType;
  owner: string;
  balance: string;
  creditLimit: string;
};

const blankForm: FormState = {
  name: "",
  institution: "",
  type: "checking",
  owner: "joint",
  balance: "",
  creditLimit: "",
};

const groupOrder: FinancialAccountType[] = [
  "checking",
  "savings",
  "cash",
  "credit_card",
  "loan",
  "other",
];

const groupIcons: Record<FinancialAccountType, Icon> = {
  checking: IconBuildingBank,
  savings: IconPigMoney,
  cash: IconCash,
  credit_card: IconCreditCard,
  loan: IconReceiptTax,
  other: IconWallet,
};

const ownerLabels: Record<string, string> = {
  user: "Me",
  spouse: "Partner",
  joint: "Joint household",
  other: "Other",
};

function totalsFor(accounts: FinancialAccount[]) {
  let assets = 0;
  let debts = 0;
  for (const account of accounts) {
    if (isDebtAccount(account.type)) debts += account.balance;
    else assets += account.balance;
  }
  return { assets, debts, netWorth: assets - debts };
}

function toForm(account: FinancialAccount): FormState {
  return {
    name: account.name,
    institution: account.institution,
    type: account.type,
    owner: account.owner,
    balance: String(account.balance),
    creditLimit: account.creditLimit === null ? "" : String(account.creditLimit),
  };
}

function toDraft(form: FormState): FinancialAccountDraft {
  return {
    name: form.name,
    institution: form.institution,
    type: form.type,
    owner: form.owner,
    balance: Number(form.balance),
    creditLimit:
      form.type === "credit_card" && form.creditLimit
        ? Number(form.creditLimit)
        : null,
  };
}

function formatUpdatedAt(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

export function AccountsWorkspace({
  initialAccounts,
  demo = false,
}: AccountsWorkspaceProps) {
  const money = useCurrencyFormatter();
  const [accounts, setAccounts] = useState(initialAccounts);
  const [selectedId, setSelectedId] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(blankForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const detailCloseRef = useRef<HTMLButtonElement>(null);
  const accountTriggerRef = useRef<HTMLButtonElement>(null);

  const selected = accounts.find((account) => account.id === selectedId) ?? null;
  const totals = totalsFor(accounts);

  function openAdd(type: FinancialAccountType = "checking") {
    setEditingId(null);
    setForm({ ...blankForm, type });
    setMessage("");
    setFormOpen(true);
  }

  function openEdit(account: FinancialAccount) {
    setEditingId(account.id);
    setForm(toForm(account));
    setMessage("");
    setFormOpen(true);
  }

  async function saveAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    const draft = toDraft(form);

    if (demo) {
      const nextAccount: FinancialAccount = {
        id: editingId ?? crypto.randomUUID(),
        ...draft,
        updatedAt: new Date().toISOString(),
      };
      setAccounts((current) =>
        editingId
          ? current.map((account) =>
              account.id === editingId ? nextAccount : account,
            )
          : [...current, nextAccount],
      );
      setSelectedId(nextAccount.id);
      setSaving(false);
      setFormOpen(false);
      return;
    }

    const result = editingId
      ? await updateFinancialAccountAction({
          id: editingId,
          ...draft,
          updatedAt:
            accounts.find((account) => account.id === editingId)?.updatedAt ??
            new Date(0).toISOString(),
        })
      : await addFinancialAccountAction(draft);
    setSaving(false);
    if (!result.ok) {
      setMessage(result.error);
      return;
    }
    setAccounts((current) =>
      editingId
        ? current.map((account) =>
            account.id === editingId ? result.data : account,
          )
        : [...current, result.data],
    );
    setSelectedId(result.data.id);
    setFormOpen(false);
  }

  async function removeAccount(account: FinancialAccount) {
    if (!window.confirm(`Delete ${account.name}? This cannot be undone.`)) return;
    setMessage("");
    if (!demo) {
      const result = await deleteFinancialAccountAction(account.id);
      if (!result.ok) {
        setMessage(result.error);
        return;
      }
    }
    setAccounts((current) => current.filter((item) => item.id !== account.id));
    setSelectedId((current) =>
      current === account.id
        ? accounts.find((item) => item.id !== account.id)?.id ?? ""
        : current,
    );
  }

  function selectAccount(
    accountId: string,
    trigger: HTMLButtonElement,
  ) {
    accountTriggerRef.current = trigger;
    setSelectedId(accountId);
    requestAnimationFrame(() => detailCloseRef.current?.focus());
  }

  function closeDetails() {
    setSelectedId("");
    requestAnimationFrame(() => accountTriggerRef.current?.focus());
  }

  return (
    <div className={styles.workspace}>
      <header className={styles.pageHeader}>
        <div>
          <span className={styles.eyebrow}>Household accounts</span>
          <h2>Every balance, in one calm view.</h2>
          <p>Add checking, savings, cash, cards, and loans to see your complete net worth.</p>
        </div>
        <button className={`${styles.addButton} btn btn-primary`} type="button" onClick={() => openAdd()}>
          <IconPlus size={18} aria-hidden="true" />
          Add account
        </button>
      </header>

      {demo ? (
        <p className={styles.demoNotice} role="note">
          Demo changes stay in this browser tab and never connect to a financial institution.
        </p>
      ) : null}
      <p className={styles.status} aria-live="polite">{message}</p>

      <div className={`${styles.accountLayout} ${selected ? styles.hasSelection : ""}`}>
        <div className={styles.accountMain}>
          <section className={`${styles.netWorthCard} card chart-summary`} aria-labelledby="net-worth-title">
            <div className={styles.summaryHeader}>
              <div>
                <span id="net-worth-title">Net worth</span>
                <strong>{money.format(totals.netWorth)}</strong>
              </div>
              <span className={styles.privateBadge}>
                <IconShieldLock size={14} aria-hidden="true" /> Household only
              </span>
            </div>
            <div className={styles.totalsGrid}>
              <div>
                <span><i className={styles.assetDot} />Assets</span>
                <strong>{money.format(totals.assets)}</strong>
              </div>
              <div>
                <span><i className={styles.debtDot} />Debts</span>
                <strong>{money.format(totals.debts)}</strong>
              </div>
            </div>
            <svg
              className={styles.netWorthLine}
              viewBox="0 0 900 100"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path className={`${styles.lineFill} finance-chart-area`} d="M0 78 C180 74 285 76 420 63 S690 49 900 22 L900 100 L0 100 Z" />
              <path className={`${styles.lineStroke} finance-chart-line`} pathLength="1" d="M0 78 C180 74 285 76 420 63 S690 49 900 22" />
              <circle className={`${styles.linePoint} finance-chart-point`} cx="900" cy="22" r="5" />
            </svg>
            <div className={styles.summaryCaption}>
              <IconChartLine size={15} aria-hidden="true" />
              Based on the current balances in {accounts.length} {accounts.length === 1 ? "account" : "accounts"}
            </div>
          </section>

          {!accounts.length ? (
            <section className={styles.emptyState}>
              <IconBuildingBank size={28} aria-hidden="true" />
              <h3>Build your household balance sheet</h3>
              <p>Start with the checking or savings account you use most often.</p>
              <button type="button" onClick={() => openAdd()}>Add your first account</button>
            </section>
          ) : (
            <div className={styles.groups}>
              {groupOrder.map((type) => {
                const grouped = accounts.filter((account) => account.type === type);
                if (!grouped.length) return null;
                const IconComponent = groupIcons[type];
                const groupTotal = grouped.reduce((sum, account) => sum + account.balance, 0);
                return (
                  <section className={`${styles.accountGroup} card`} aria-labelledby={`group-${type}`} key={type}>
                    <div className={styles.groupHeader}>
                      <div>
                        <IconComponent size={17} aria-hidden="true" />
                        <h3 id={`group-${type}`}>{financialAccountTypeLabels[type]}</h3>
                        <span>{grouped.length}</span>
                      </div>
                      <strong>{money.format(groupTotal)}</strong>
                    </div>
                    <div className={styles.accountRows}>
                      {grouped.map((account) => {
                        const AccountIcon = groupIcons[account.type];
                        const utilization =
                          account.type === "credit_card" && account.creditLimit
                            ? (account.balance / account.creditLimit) * 100
                            : null;
                        return (
                          <SwipeActionRow key={account.id} onEdit={() => openEdit(account)} onDelete={() => { void removeAccount(account); }}>
                          <button
                            className={`${styles.accountRow} ${selectedId === account.id ? styles.selectedRow : ""}`}
                            type="button"
                            aria-pressed={selectedId === account.id}
                            onClick={(event) => selectAccount(account.id, event.currentTarget)}
                          >
                            <span className={styles.accountIcon}><AccountIcon size={20} aria-hidden="true" /></span>
                            <span className={styles.accountCopy}>
                              <strong>{account.name}</strong>
                              <small>{account.institution || "Manual account"} · {ownerLabels[account.owner] ?? account.owner}</small>
                            </span>
                            <span className={styles.accountMeta}>
                              {utilization !== null ? <small>{utilization.toFixed(1)}% used</small> : <small>Updated {formatUpdatedAt(account.updatedAt)}</small>}
                              <strong>{money.format(account.balance)}</strong>
                            </span>
                            <IconChevronRight className={styles.rowChevron} size={18} aria-hidden="true" />
                          </button>
                          </SwipeActionRow>
                        );
                      })}
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </div>

        <aside
                  className={`${styles.detailPanel} card glass-panel`}
          aria-label="Selected account details"
          onKeyDown={(event) => {
            if (event.key === "Escape") closeDetails();
          }}
        >
          {selected ? (
            <>
              <div className={styles.detailHeader}>
                <span>{financialAccountTypeLabels[selected.type]}</span>
                <button ref={detailCloseRef} type="button" onClick={closeDetails} aria-label="Close account details">
                  <IconX size={20} aria-hidden="true" />
                </button>
              </div>
              <div className={styles.detailHero}>
                <span className={styles.detailIcon}>{(() => { const DetailIcon = groupIcons[selected.type]; return <DetailIcon size={24} aria-hidden="true" />; })()}</span>
                <div>
                  <span>{selected.institution || "Manual account"}</span>
                  <h3>{selected.name}</h3>
                </div>
                <strong>{money.format(selected.balance)}</strong>
              </div>
              <dl className={styles.detailList}>
                <div><dt>Owner</dt><dd>{ownerLabels[selected.owner] ?? selected.owner}</dd></div>
                <div><dt>Account type</dt><dd>{financialAccountTypeLabels[selected.type]}</dd></div>
                <div><dt>Last updated</dt><dd>{formatUpdatedAt(selected.updatedAt)}</dd></div>
                {selected.creditLimit ? <div><dt>Credit limit</dt><dd>{money.format(selected.creditLimit)}</dd></div> : null}
              </dl>
              {selected.creditLimit ? (
                <div className={styles.utilization}>
                  <div><span>Credit utilization</span><strong>{((selected.balance / selected.creditLimit) * 100).toFixed(1)}%</strong></div>
                  <div className={styles.utilizationTrack}><i data-animate-progress style={{ width: `${Math.min((selected.balance / selected.creditLimit) * 100, 100)}%` }} /></div>
                </div>
              ) : null}
              <div className={styles.detailActions}>
                <button type="button" onClick={() => openEdit(selected)}><IconPencil size={17} aria-hidden="true" />Edit account</button>
                <button className={`${styles.deleteButton} btn btn-ghost`} type="button" onClick={() => removeAccount(selected)}><IconTrash size={17} aria-hidden="true" />Delete</button>
              </div>
            </>
          ) : (
            <div className={styles.detailEmpty}>
              <IconWallet size={30} aria-hidden="true" />
              <p>Select an account to view its details.</p>
            </div>
          )}
        </aside>
      </div>

      <Drawer
        opened={formOpen}
        onClose={() => setFormOpen(false)}
        position="right"
        size="md"
        title={editingId ? "Edit account" : "Add account"}
      >
        <form className={styles.accountForm} onSubmit={saveAccount}>
          <p>Track a balance manually. Bank connections can be added later without changing this account layout.</p>
          <label>
            Account type
            <select value={form.type} onChange={(event) => setForm((current) => ({ ...current, type: event.target.value as FinancialAccountType }))}>
              {financialAccountTypes.map((type) => <option value={type} key={type}>{financialAccountTypeLabels[type]}</option>)}
            </select>
          </label>
          <label>
            Account name
            <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required maxLength={100} autoComplete="off" placeholder="Everyday checking" />
          </label>
          <label>
            Institution
            <input value={form.institution} onChange={(event) => setForm((current) => ({ ...current, institution: event.target.value }))} maxLength={100} autoComplete="organization" placeholder="Bank or credit union" />
            <small>Optional for cash or other manual accounts.</small>
          </label>
          <div className={styles.formGrid}>
            <label>
              Current balance
              <input value={form.balance} onChange={(event) => setForm((current) => ({ ...current, balance: event.target.value }))} required min="0" step="0.01" inputMode="decimal" type="number" placeholder="0.00" />
            </label>
            <label>
              Owner
              <select value={form.owner} onChange={(event) => setForm((current) => ({ ...current, owner: event.target.value }))}>
                {Object.entries(ownerLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}
              </select>
            </label>
          </div>
          {form.type === "credit_card" ? (
            <label>
              Credit limit
              <input value={form.creditLimit} onChange={(event) => setForm((current) => ({ ...current, creditLimit: event.target.value }))} min="0.01" step="0.01" inputMode="decimal" type="number" placeholder="Optional" />
              <small>Used to calculate credit utilization.</small>
            </label>
          ) : null}
          <p className={styles.formError} role="alert">{message}</p>
          <button className={`${styles.submitButton} btn btn-primary`} type="submit" disabled={saving}>
            {saving ? "Saving…" : editingId ? "Save changes" : "Add account"}
          </button>
        </form>
      </Drawer>
    </div>
  );
}
