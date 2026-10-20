import styles from "./ProgressBar.module.css";

export function ProgressBar({ value, max, label, leftLabel }: { value: number; max: number; label: string; leftLabel?: string }) {
  const percent = max > 0 ? value / max * 100 : 0;
  const status = percent > 100 ? "over" : percent >= 80 ? "close" : "track";
  return <div className={styles.root}><div className={styles.labels}><span>{label}</span>{leftLabel && <span>{leftLabel}</span>}<span className={styles.status} data-status={status}>{status === "over" ? "Over budget" : status === "close" ? "Getting close" : "On track"}</span></div><div className={styles.track} role="progressbar" aria-label={`${label}: ${status === "over" ? "over budget" : status === "close" ? "getting close" : "on track"}`} aria-valuemin={0} aria-valuemax={max} aria-valuenow={value}><i data-status={status} style={{ width: `${Math.min(percent, 100)}%` }} /></div></div>;
}
