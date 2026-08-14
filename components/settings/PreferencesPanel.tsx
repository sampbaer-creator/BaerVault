"use client";

import { IconCheck, IconChevronDown, IconRefresh } from "@tabler/icons-react";
import { type CSSProperties, useRef } from "react";

import { usePreferences } from "@/components/preferences/PreferencesProvider";
import {
  financePaletteIds,
  financePalettes,
  type FinancePaletteId,
} from "@/lib/themePalettes";
import styles from "./SettingsWorkspace.module.css";

export function PreferencesPanel() {
  const { preferences, update, reset } = usePreferences();
  const paletteMenuRef = useRef<HTMLDetailsElement>(null);
  const selectedPalette = financePalettes[preferences.palette];

  return (
    <>
      <section id="appearance">
        <h3>Appearance</h3>
        <p>Choose a finance palette for this device. Ledger Navy is the BearVault default.</p>
        <Field label="Color palette">
          <details className={styles.palettePicker} ref={paletteMenuRef}>
            <summary style={paletteStyle(preferences.palette)}>
              <span className={styles.palettePreview} aria-hidden="true"><i /><i /><i /><i /><i /></span>
              <span className={styles.paletteSummaryCopy}>
                <strong>{selectedPalette.name}</strong>
                <small>{selectedPalette.mood}</small>
              </span>
              <IconChevronDown className={styles.paletteChevron} size={18} aria-hidden="true" />
            </summary>
            <div className={styles.paletteMenu} role="group" aria-label="Color palette options">
              {financePaletteIds.map((paletteId) => {
                const palette = financePalettes[paletteId];
                const selected = preferences.palette === paletteId;
                return (
                  <button
                    key={paletteId}
                    type="button"
                    style={paletteStyle(paletteId)}
                    aria-pressed={selected}
                    onClick={() => {
                      update({ palette: paletteId });
                      paletteMenuRef.current?.removeAttribute("open");
                    }}
                  >
                    <span className={styles.palettePreview} aria-hidden="true"><i /><i /><i /><i /><i /></span>
                    <span className={styles.paletteChoiceCopy}>
                      <strong>{palette.name}</strong>
                      <small>{palette.mood}</small>
                    </span>
                    {selected ? <IconCheck size={17} aria-hidden="true" /> : null}
                  </button>
                );
              })}
            </div>
          </details>
        </Field>
        <Field label="Light and dark mode">
          <Segment value={preferences.theme} options={["light", "dark", "system"]} onChange={(theme) => update({ theme: theme as typeof preferences.theme })} />
        </Field>
        <Field label="Density">
          <Segment value={preferences.density} options={["comfortable", "compact"]} onChange={(density) => update({ density: density as typeof preferences.density })} />
        </Field>
        <label className={styles.toggle}>
          <span><strong>Reduce motion</strong><small>Minimize non-essential transitions.</small></span>
          <input type="checkbox" checked={preferences.reducedMotion} onChange={(event) => update({ reducedMotion: event.target.checked })} />
        </label>
        <button className={styles.reset} onClick={reset}><IconRefresh size={16} />Reset appearance</button>
      </section>
      <section id="formatting">
        <h3>Formatting</h3>
        <Field label="Currency">
          <select value={preferences.currency} onChange={(event) => update({ currency: event.target.value })}>
            <option value="USD">USD — US Dollar</option><option value="CAD">CAD — Canadian Dollar</option><option value="EUR">EUR — Euro</option><option value="GBP">GBP — British Pound</option>
          </select>
        </Field>
        <p className={styles.note}>This changes display formatting, not exchange rates.</p>
      </section>
    </>
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className={styles.field}><strong>{label}</strong>{children}</div>;
}

function Segment({ value, options, onChange }: { value: string; options: string[]; onChange: (value: string) => void }) {
  return <div className={styles.segment}>{options.map((option) => <button key={option} aria-pressed={value === option} onClick={() => onChange(option)}>{option}</button>)}</div>;
}
