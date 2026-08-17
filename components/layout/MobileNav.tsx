"use client";

import Link from "next/link";

import { mobileNavigation } from "./navigation";
import styles from "./AppShell.module.css";

type MobileNavProps = {
  pathname: string;
};

export function MobileNav({ pathname }: MobileNavProps) {
  return (
    <nav className={styles.mobileNav} aria-label="Mobile navigation">
      {mobileNavigation.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href;

        return (
          <Link
            className={`${styles.mobileLink} ${isActive ? styles.mobileLinkActive : ""}`}
            href={href}
            aria-current={isActive ? "page" : undefined}
            key={href}
          >
            <Icon size={21} stroke={1.8} aria-hidden="true" />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
