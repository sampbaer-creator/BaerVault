import styles from "./DemoGoals.module.css";

const goals = [
  { name: "Emergency Fund", target: "Nov 2026", saved: "$15,000", detail: "of $18,000 · $3,000 to go", monthly: "$500/mo", progress: 83, color: "var(--chart-primary)" },
  { name: "House Down Payment", target: "Dec 2027", saved: "$28,400", detail: "of $60,000 · $31,600 to go", monthly: "$1,200/mo", progress: 47, color: "var(--chart-secondary)" },
  { name: "New Car", target: "Mar 2027", saved: "$6,200", detail: "of $12,000 · $5,800 to go", monthly: "$400/mo", progress: 52, color: "var(--app-accent)" },
  { name: "Trip to Japan", target: "Sep 2026", saved: "$3,100", detail: "of $5,000 · $1,900 to go", monthly: "$300/mo", progress: 62, color: "var(--money-positive)" },
  { name: "Home Renovation", target: "2028", saved: "$4,800", detail: "of $20,000 · $15,200 to go", monthly: "$350/mo", progress: 24, color: "var(--brand-gold)" },
  { name: "Retirement", target: "2050", saved: "$148,000", detail: "of $500,000 · $352,000 to go", monthly: "$1,500/mo", progress: 30, color: "var(--chart-tertiary)" },
];

export function DemoGoals() {
  return <div className={styles.page}>
    <div className={styles.metrics}><Metric label="Total saved" value="$205,500" /><Metric label="Combined target" value="$615,000" /><Metric label="On track" value="6 of 6" positive /></div>
    <section className={styles.goalsGrid} aria-label="Savings goals">{goals.map((goal) => <article className={styles.goal} key={goal.name}>
      <div className={styles.goalHead}><div className={styles.ring} style={{ "--progress": goal.progress, "--ring": goal.color } as React.CSSProperties}><strong>{goal.progress}%</strong></div><div><h3>{goal.name}</h3><span className={styles.goalMeta}>Target {goal.target}</span></div></div>
      <p className={styles.goalValue}><strong>{goal.saved}</strong></p><span className={styles.goalMeta}>{goal.detail}</span>
      <div className={styles.goalFooter}><span>{goal.monthly}</span><span className={styles.status}>On track</span></div>
    </article>)}</section>
  </div>;
}
function Metric({ label, value, positive }: { label: string; value: string; positive?: boolean }) { return <div className={styles.metric}><span>{label}</span><strong className={positive ? styles.positive : ""}>{value}</strong></div>; }

