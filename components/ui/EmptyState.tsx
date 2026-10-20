import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./EmptyState.module.css";

export function EmptyState({ title, description, action, href, illustration }: { title: string; description: string; action: string; href: string; illustration?: ReactNode }) {
  return <section className={styles.empty}><div>{illustration}</div><h2>{title}</h2><p>{description}</p><Link href={href}>{action}</Link></section>;
}
