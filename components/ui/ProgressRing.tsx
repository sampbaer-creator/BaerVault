import styles from "./ProgressRing.module.css";

export function ProgressRing({ value, max, label, center, leftLabel }: { value: number; max: number; label: string; center?: string; leftLabel?: string }) {
  const ratio = max > 0 ? value / max : 0;
  const status = ratio > 1 ? "over" : ratio >= .8 ? "close" : "track";
  const progress = Math.min(ratio, 1);
  const circumference = 2 * Math.PI * 42;
  return <div className={styles.root} aria-label={`${label}, ${leftLabel ?? ""}`}><svg viewBox="0 0 100 100" role="img" aria-label={`${label}: ${status === "over" ? "over budget" : status === "close" ? "getting close" : "on track"}`}><circle className={styles.base} cx="50" cy="50" r="42"/><circle className={styles.value} data-status={status} cx="50" cy="50" r="42" strokeDasharray={`${circumference * progress} ${circumference}`} /><text x="50" y="54" textAnchor="middle">{center ?? `${Math.round(ratio * 100)}%`}</text></svg><strong>{label}</strong>{leftLabel && <small>{leftLabel}</small>}<span>{status === "over" ? "Over budget" : status === "close" ? "Getting close" : "On track"}</span></div>;
}
