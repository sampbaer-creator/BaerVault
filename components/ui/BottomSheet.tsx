"use client";

import { Drawer, Modal } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import type { ReactNode } from "react";
import styles from "./BottomSheet.module.css";

export function BottomSheet({ opened, onClose, title, children }: { opened: boolean; onClose: () => void; title: string; children: ReactNode }) {
  const mobile = useMediaQuery("(max-width: 47.999rem)");
  return mobile
    ? <Drawer opened={opened} onClose={onClose} position="bottom" title={title} size="auto" classNames={{ content: styles.drawer, body: styles.body }}>{children}</Drawer>
    : <Modal opened={opened} onClose={onClose} title={title} centered classNames={{ content: styles.modal }}>{children}</Modal>;
}
