"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";

import { mobileSectionNavigation } from "./navigation";
import styles from "./AppShell.module.css";

type MobileNavProps = {
  pathname: string;
};

export function MobileNav({ pathname }: MobileNavProps) {
  const links = mobileSectionNavigation;
  const navRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const nav = navRef.current;
    const active = nav?.querySelector<HTMLElement>("[aria-current='page']");
    if (nav && active) {
      const center = () => { nav.scrollLeft = active.offsetLeft - nav.clientWidth / 2 + active.clientWidth / 2; };
      requestAnimationFrame(center);
      const timer = window.setTimeout(center, 120);
      return () => window.clearTimeout(timer);
    }
  }, [pathname]);

  return (
      <nav ref={navRef} className={`${styles.mobileNav} mobile-nav-enhanced`} aria-label="Mobile sections">
        {links.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;

          return (
            <Link
              className={`${styles.mobileLink} ${isActive ? styles.mobileLinkActive : ""}`}
              href={href}
              prefetch={isActive ? false : undefined}
              aria-current={isActive ? "page" : undefined}
              key={href}
            >
              {isActive && (
                <motion.span
                  aria-hidden="true"
                  className={styles.mobileActiveIndicator}
                  layoutId="authenticated-mobile-active-tab"
                  transition={reduceMotion ? { duration: 0 } : { type: "spring", duration: 0.5, bounce: 0.2 }}
                />
              )}
              <Icon size={18} stroke={1.9} aria-hidden="true" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
  );
}
