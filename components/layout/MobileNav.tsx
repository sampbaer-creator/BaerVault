"use client";

import { Drawer } from "@mantine/core";
import { IconDots } from "@tabler/icons-react";
import Link from "next/link";
import { useState } from "react";

import { mobileNavigation, moreNavigation } from "./navigation";
import styles from "./AppShell.module.css";

type MobileNavProps = {
  pathname: string;
};

export function MobileNav({ pathname }: MobileNavProps) {
  const [moreOpened, setMoreOpened] = useState(false);
  const moreIsActive = moreNavigation.some(({ href }) => href === pathname);

  return (
    <>
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
        <button
          className={`${styles.moreButton} ${moreIsActive ? styles.mobileLinkActive : ""}`}
          type="button"
          onClick={() => setMoreOpened(true)}
          aria-haspopup="dialog"
          aria-expanded={moreOpened}
          aria-label="Open more navigation options"
        >
          <IconDots size={21} stroke={1.8} aria-hidden="true" />
          <span>More</span>
        </button>
      </nav>

      <Drawer
        opened={moreOpened}
        onClose={() => setMoreOpened(false)}
        position="bottom"
        size="auto"
        radius="lg"
        title={<span className={styles.drawerTitle}>More</span>}
        classNames={{ header: styles.drawerHeader, body: styles.drawerBody }}
      >
        <nav aria-label="Additional navigation">
          {moreNavigation.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;

            return (
              <Link
                className={`${styles.drawerLink} ${isActive ? styles.drawerLinkActive : ""}`}
                href={href}
                aria-current={isActive ? "page" : undefined}
                onClick={() => setMoreOpened(false)}
                key={href}
              >
                <Icon size={22} stroke={1.8} aria-hidden="true" />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
      </Drawer>
    </>
  );
}
