"use client";

import { IconRefresh } from "@tabler/icons-react";
import type { CSSProperties } from "react";

import { usePreferences } from "@/components/preferences/PreferencesProvider";
import { financePaletteIds, financePalettes } from "@/lib/themePalettes";
import styles from "./SettingsWorkspace.module.css";

export function PreferencesPanel() {
  const { preferences, update, reset } = usePreferences();

  return (
    <>
      <section id="appearance">
        <h3>Appearance</h3>
        <p>Choose a finance palette for this device. Vault Green is the BearVault default.</p>
        <Field label="Color palette">
          <div className={styles.palettes}>
            {financePaletteIds.map((paletteId) => {
              const palette = financePalettes[paletteId];
              const previewStyle = {
                "--palette-1": palette.colors[0],
                "--palette-2": palette.colors[1],
                "--palette-3": palette.colors[2],
                "--palette-4": palette.colors[3],
                "--palette-5": palette.colors[4],
              } as CSSProperties;
              return (
                <button
                  key={paletteId}
                  style={previewStyle}
                  aria-label={`${palette.name}: ${palette.mood}`}
                  aria-pressed={preferences.palette === paletteId}
                  onClick={() => update({ palette: paletteId })}
                >
                  <span aria-hidden="true"><i /><i /><i /><i /><i /></span>
                  <strong>{palette.name}</strong>
                  <small>{palette.mood}</small>
                </button>
              );
            })}
          </div>
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className={styles.field}><strong>{label}</strong>{children}</div>;
}

function Segment({ value, options, onChange }: { value: string; options: string[]; onChange: (value: string) => void }) {
  return <div className={styles.segment}>{options.map((option) => <button key={option} aria-pressed={value === option} onClick={() => onChange(option)}>{option}</button>)}</div>;
}
