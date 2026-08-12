import styles from "./ReferenceWorkspace.module.css";

const accounts = [
  { name: "Everyday Checking", suffix: "4821", type: "Checking", balance: "$8,240.15", note: "Primary account", letter: "E" },
  { name: "High-Yield Savings", suffix: "7233", type: "Savings", balance: "$42,380.00", note: "4.30% APY", letter: "H" },
  { name: "Emergency Fund", suffix: "1190", type: "Savings", balance: "$15,000.00", note: "83% funded", letter: "E" },
  { name: "Sapphire Credit", suffix: "9007", type: "Credit card", balance: "−$1,240.55", note: "Statement due Jul 28", letter: "S", debt: true },
  { name: "Fidelity Joint", suffix: "3355", type: "Investment", balance: "$54,080.30", note: "+2.04% today", letter: "F" },
  { name: "Samuel Roth IRA", suffix: "5084", type: "Investment", balance: "$9,779.76", note: "Retirement", letter: "R" },
];

export function AccountsWorkspace() {
  return <div className={styles.page}>
    <div className={styles.metrics}>
      <Metric label="Total cash" value="$65,620.15" note="Across 3 accounts" />
      <Metric label="Total investments" value="$63,860.06" note="▲ 2.06% today" positive />
      <Metric label="Total debt" value="$1,240.55" note="10% of available credit" />
    </div>
    <section className={styles.accountGrid} aria-label="Linked accounts">
      {accounts.map((account) => <article className={styles.card} key={account.name}>
        <div className={styles.cardTop}><div className={styles.cardIdentity}><span className={styles.iconTile}>{account.letter}</span><div><strong>{account.name}</strong><small>•• {account.suffix}</small></div></div><span className={styles.type}>{account.type}</span></div>
        <p className={`${styles.balance} ${account.debt ? styles.negative : ""}`}>{account.balance}</p><span className={styles.cardMeta}>{account.note}</span>
        <svg className={`${styles.spark} ${account.debt ? styles.debt : ""}`} viewBox="0 0 115 38" aria-hidden="true"><polyline points="1,33 24,22 47,31 70,10 92,24 114,15" /></svg>
      </article>)}
    </section>
  </div>;
}

function Metric({ label, value, note, positive }: { label: string; value: string; note: string; positive?: boolean }) {
  return <div className={styles.metric}><span>{label}</span><strong>{value}</strong><span className={positive ? styles.positive : ""}>{note}</span></div>;
}

