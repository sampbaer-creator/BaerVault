"use client";
import Link from "next/link";
import { mobileSectionNavigation } from "./navigation";
import { type MonthSelection, withMonth } from "@/lib/helpers/monthSelection";
import styles from "./AppShell.module.css";

export function MobileNav({ pathname, selectedMonth }: { pathname: string; selectedMonth?: MonthSelection }) {
  return <nav className={styles.mobileNav} aria-label="Mobile sections">
    {mobileSectionNavigation.map(({ href, label, icon: Icon }) => <Link
      key={href}
      href={selectedMonth ? withMonth(href, selectedMonth) : href}
      className={`${styles.mobileLink} ${pathname === href ? styles.mobileLinkActive : ""}`}
      aria-current={pathname === href ? "page" : undefined}
    ><Icon size={22} stroke={1.8} aria-hidden="true" /><span>{label}</span></Link>)}
  </nav>;
}
