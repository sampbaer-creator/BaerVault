"use client";

import { IconCheck, IconChevronDown } from "@tabler/icons-react";
import { type CSSProperties, useEffect, useRef, useState } from "react";

import {
  financePaletteIds,
  financePalettes,
  type FinancePaletteId,
} from "@/lib/themePalettes";
import styles from "./SettingsWorkspace.module.css";

type PaletteDropdownProps = {
  value: FinancePaletteId;
  onChange: (palette: FinancePaletteId) => void;
};

export function PaletteDropdown({ value, onChange }: PaletteDropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const selected = financePalettes[value];

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setOpen(false);
      buttonRef.current?.focus();
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function openAndFocus(index: number) {
    setOpen(true);
    requestAnimationFrame(() => optionRefs.current[index]?.focus());
  }

  function moveFocus(currentIndex: number, direction: 1 | -1) {
    const next =
      (currentIndex + direction + financePaletteIds.length) %
      financePaletteIds.length;
    optionRefs.current[next]?.focus();
  }

  return (
    <div className={styles.palettePicker} ref={rootRef}>
      <button
        className={styles.paletteTrigger}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls="palette-options"
        onClick={() => setOpen((current) => !current)}
        onKeyDown={(event) => {
          if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
          event.preventDefault();
          const selectedIndex = financePaletteIds.indexOf(value);
          openAndFocus(
            event.key === "ArrowDown"
              ? selectedIndex
              : Math.max(0, selectedIndex - 1),
          );
        }}
        ref={buttonRef}
        style={paletteStyle(value)}
      >
        <PalettePreview />
        <span className={styles.paletteSummaryCopy}>
          <strong>{selected.name}</strong>
          <small>{selected.mood}</small>
        </span>
        <IconChevronDown
          className={styles.paletteChevron}
          size={18}
          aria-hidden="true"
        />
      </button>

      {open ? (
        <div
          className={styles.paletteMenu}
          id="palette-options"
          role="listbox"
          aria-label="Color palette"
        >
          {financePaletteIds.map((paletteId, index) => {
            const palette = financePalettes[paletteId];
            const isSelected = value === paletteId;
            return (
              <button
                key={paletteId}
                type="button"
                role="option"
                aria-selected={isSelected}
                ref={(node) => {
                  optionRefs.current[index] = node;
                }}
                tabIndex={isSelected ? 0 : -1}
                style={paletteStyle(paletteId)}
                onClick={() => {
                  onChange(paletteId);
                  setOpen(false);
                  buttonRef.current?.focus();
                }}
                onKeyDown={(event) => {
                  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                    event.preventDefault();
                    moveFocus(index, event.key === "ArrowDown" ? 1 : -1);
                  } else if (event.key === "Home" || event.key === "End") {
                    event.preventDefault();
                    optionRefs.current[
                      event.key === "Home" ? 0 : financePaletteIds.length - 1
                    ]?.focus();
                  }
                }}
              >
                <PalettePreview />
                <span className={styles.paletteChoiceCopy}>
                  <strong>{palette.name}</strong>
                  <small>{palette.mood}</small>
                </span>
                {isSelected ? <IconCheck size={17} aria-hidden="true" /> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function PalettePreview() {
  return (
    <span className={styles.palettePreview} aria-hidden="true">
      <i />
      <i />
      <i />
      <i />
      <i />
    </span>
  );
}

function paletteStyle(paletteId: FinancePaletteId) {
  const colors = financePalettes[paletteId].colors;
  return {
    "--palette-1": colors[0],
    "--palette-2": colors[1],
    "--palette-3": colors[2],
    "--palette-4": colors[3],
    "--palette-5": colors[4],
  } as CSSProperties;
}
