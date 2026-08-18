"use client";

import { IconPencil, IconTrash } from "@tabler/icons-react";
import { animate, motion, useDragControls, useMotionValue, useReducedMotion } from "motion/react";
import { type PointerEvent, type ReactNode, useEffect, useId, useRef, useState } from "react";

import styles from "./SwipeActionRow.module.css";

const OPEN_EVENT = "bearvault:swipe-row-open";
const CLOSE_EVENT = "bearvault:swipe-row-close";
const ACTION_WIDTH = 144;

type SwipeActionRowProps = {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  editLabel?: string;
  deleteLabel?: string;
  onEdit: () => void;
  onDelete: () => void;
};

export function SwipeActionRow({
  children,
  className = "",
  contentClassName = "",
  editLabel = "Edit",
  deleteLabel = "Delete",
  onEdit,
  onDelete,
}: SwipeActionRowProps) {
  const id = useId();
  const x = useMotionValue(0);
  const controls = useDragControls();
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const dragging = useRef(false);
  const rootRef = useRef<HTMLDivElement>(null);

  function settle(nextOpen: boolean) {
    setOpen(nextOpen);
    animate(x, nextOpen ? -ACTION_WIDTH : 0, reduceMotion
      ? { duration: 0.12, ease: "easeOut" }
      : { type: "spring", duration: 0.5, bounce: 0.2 });
  }

  useEffect(() => {
    const closeOther = (event: Event) => {
      if ((event as CustomEvent<string>).detail !== id) settle(false);
    };
    const close = () => settle(false);
    const closeFromOutside = (event: globalThis.PointerEvent) => {
      if (open && !rootRef.current?.contains(event.target as Node)) settle(false);
    };
    window.addEventListener(OPEN_EVENT, closeOther);
    window.addEventListener(CLOSE_EVENT, close);
    window.addEventListener("scroll", close, { capture: true, passive: true });
    document.addEventListener("pointerdown", closeFromOutside, true);
    return () => {
      window.removeEventListener(OPEN_EVENT, closeOther);
      window.removeEventListener(CLOSE_EVENT, close);
      window.removeEventListener("scroll", close, true);
      document.removeEventListener("pointerdown", closeFromOutside, true);
    };
  });

  function startPointer(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse") return;
    pointerStart.current = { x: event.clientX, y: event.clientY };
    dragging.current = false;
  }

  function movePointer(event: PointerEvent<HTMLDivElement>) {
    const start = pointerStart.current;
    if (!start || dragging.current) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) {
      pointerStart.current = null;
      return;
    }
    if (Math.abs(dx) >= 10 && Math.abs(dx) > Math.abs(dy) * 1.25) {
      dragging.current = true;
      window.dispatchEvent(new CustomEvent(OPEN_EVENT, { detail: id }));
      controls.start(event.nativeEvent);
    }
  }

  function runAction(action: () => void) {
    settle(false);
    action();
  }

  return (
    <div
      ref={rootRef}
      data-page-swipe-ignore
      className={`${styles.root} ${open ? styles.open : ""} ${className}`}
      onPointerDown={startPointer}
      onPointerMove={movePointer}
      onPointerUp={() => { pointerStart.current = null; }}
      onPointerCancel={() => { pointerStart.current = null; }}
    >
      <div className={styles.actions} aria-hidden={!open}>
        <button type="button" tabIndex={open ? 0 : -1} onClick={() => runAction(onEdit)}>
          <IconPencil size={18} aria-hidden="true" />{editLabel}
        </button>
        <button type="button" tabIndex={open ? 0 : -1} onClick={() => runAction(onDelete)}>
          <IconTrash size={18} aria-hidden="true" />{deleteLabel}
        </button>
      </div>
      <motion.div
        className={`${styles.content} ${contentClassName}`}
        style={{ x }}
        drag="x"
        dragControls={controls}
        dragListener={false}
        dragConstraints={{ left: -ACTION_WIDTH, right: 0 }}
        dragElastic={0.08}
        onDragEnd={(_, info) => {
          dragging.current = false;
          const nextOpen = x.get() < -52 || info.velocity.x < -450;
          settle(nextOpen);
          if (nextOpen) window.dispatchEvent(new CustomEvent(OPEN_EVENT, { detail: id }));
        }}
        onClickCapture={(event) => {
          if (!open) return;
          event.preventDefault();
          event.stopPropagation();
          settle(false);
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}

export function closeSwipeActionRows() {
  window.dispatchEvent(new Event(CLOSE_EVENT));
}
