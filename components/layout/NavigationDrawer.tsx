"use client";

import { Drawer } from "@mantine/core";
import { IconMenu2 } from "@tabler/icons-react";
import Link from "next/link";
import { useState } from "react";
import { allNavigation } from "./navigation";
import { type MonthSelection, withMonth } from "@/lib/helpers/monthSelection";
import styles from "./NavigationDrawer.module.css";

export function NavigationDrawer({ pathname, demo = false, selectedMonth }: {
  pathname: string;
  demo?: boolean;
  selectedMonth?: MonthSelection;
}) {
  const [opened, setOpened] = useState(false);
  return <>
    <button className={styles.trigger} type="button" aria-label="All pages" aria-haspopup="dialog" aria-expanded={opened} onClick={() => setOpened(true)}>
      <IconMenu2 size={24} aria-hidden="true" />
    </button>
    <Drawer opened={opened} onClose={() => setOpened(false)} title="Your household" position="left" size="min(360px, 100%)" closeButtonProps={{ "aria-label": "Close navigation" }}>
      <nav className={styles.links} aria-label="All pages">
        {allNavigation.map(({ href, label, icon: Icon }) => {
          const route = demo ? href === "/dashboard" ? "/demo" : `/demo${href}` : href;
          return <Link key={href} href={selectedMonth ? withMonth(route, selectedMonth) : route} aria-current={pathname === route ? "page" : undefined} onClick={() => setOpened(false)}>
            <Icon size={21} aria-hidden="true" /><span>{label}</span>
          </Link>;
        })}
      </nav>
    </Drawer>
  </>;
}
