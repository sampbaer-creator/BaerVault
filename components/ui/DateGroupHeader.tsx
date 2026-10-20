import styles from "./DateGroupHeader.module.css";

export function DateGroupHeader({ date, now = new Date() }: { date: string; now?: Date }) {
  const day = new Date(`${date}T12:00:00`);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(day.getFullYear(), day.getMonth(), day.getDate());
  const offset = Math.round((today.getTime() - target.getTime()) / 86_400_000);
  const label = offset === 0 ? "Today" : offset === 1 ? "Yesterday" : day.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
  return <h3 className={styles.header}>{label}</h3>;
}
