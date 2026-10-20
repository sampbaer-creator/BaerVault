import type { ButtonHTMLAttributes } from "react";
import styles from "./FilterPill.module.css";

export function FilterPill({ selected = false, children, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { selected?: boolean }) {
  return <button {...props} type={props.type ?? "button"} className={`${styles.pill} ${props.className ?? ""}`} aria-pressed={selected} data-selected={selected}>{children}</button>;
}
