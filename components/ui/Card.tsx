import { type HTMLAttributes, type ReactNode } from "react";
import Link from "next/link";
import styles from "./Card.module.css";

export function Card({ title, href, children, className = "", ...props }: HTMLAttributes<HTMLElement> & { title?: string; href?: string; children: ReactNode }) {
  return <section className={`${styles.card} ${className}`} {...props}>{(title || href) && <header className={styles.header}>{title && <h2>{title}</h2>}{href && <Link href={href}>View all</Link>}</header>}{children}</section>;
}
