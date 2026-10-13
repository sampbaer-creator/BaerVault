"use client";

import { Drawer, Modal } from "@mantine/core";
import { useEffect, useState, type ComponentProps } from "react";
import styles from "./ConfirmDialog.module.css";

type EditorDrawerProps = ComponentProps<typeof Drawer> & { dirty?: boolean; busy?: boolean };

/** Keep a financial draft until the user saves or explicitly discards it. */
export function EditorDrawer({ dirty = false, busy = false, opened, onClose, children, ...props }: EditorDrawerProps) {
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!opened || !dirty) return;
    const protectDraft = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", protectDraft);
    return () => window.removeEventListener("beforeunload", protectDraft);
  }, [dirty, opened]);

  function requestClose() {
    if (busy) return;
    if (dirty) setConfirming(true);
    else onClose();
  }

  return <>
    <Drawer {...props} opened={opened} onClose={requestClose} closeOnEscape={!busy} closeOnClickOutside={!busy}>
      {children}
      <button className={styles.cancelEdit} type="button" disabled={busy} onClick={requestClose}>Cancel</button>
    </Drawer>
    <Modal opened={opened && confirming} onClose={() => setConfirming(false)} centered title="Discard unsaved changes?">
      <p>Your changes have not been saved.</p>
      <div className={styles.actions}>
        <button type="button" onClick={() => setConfirming(false)}>Keep editing</button>
        <button className={styles.danger} type="button" onClick={() => { setConfirming(false); onClose(); }}>Discard changes</button>
      </div>
    </Modal>
  </>;
}
