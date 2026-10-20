import type { ReactNode } from "react";
import styles from "./ListRow.module.css";

export function ListRow({ icon, title, subtitle, amount, avatar }: { icon?: ReactNode; title: string; subtitle?: string; amount?: string; avatar?: ReactNode }) {
  return <div className={styles.row}>{icon && <span className={styles.icon}>{icon}</span>}<span className={styles.copy}><strong>{title}</strong>{subtitle && <small>{subtitle}</small>}</span>{avatar}{amount && <strong className={styles.amount}>{amount}</strong>}</div>;
}
