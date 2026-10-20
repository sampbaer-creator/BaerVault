import styles from "./NavBadge.module.css";

export function NavBadge({ count }: { count: number }) {
  return count > 0 ? <span className={styles.badge} aria-label={`${count} items to review`}>{count > 99 ? "99+" : count}</span> : null;
}
