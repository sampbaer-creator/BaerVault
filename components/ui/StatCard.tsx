import styles from "./StatCard.module.css";

export function StatCard({ label, value, delta, comparison = "vs last month" }: { label: string; value: string; delta?: number; comparison?: string }) {
  return <section className={styles.card} aria-label={`${label}: ${value}`}><span>{label}</span><strong>{value}</strong>{delta !== undefined && <small data-positive={delta >= 0}>{delta >= 0 ? "▲" : "▼"} {Math.abs(delta)}% {comparison}</small>}</section>;
}
