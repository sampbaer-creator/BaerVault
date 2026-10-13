"use client";

import {
  IconCurrencyDollar,
  IconMoonStars,
} from "@tabler/icons-react";

import { usePreferences } from "@/components/preferences/PreferencesProvider";
import styles from "./SettingsWorkspace.module.css";

export function PreferencesPanel() {
  const { preferences, update, ready } = usePreferences();
  return (
    <>
      <section id="theme" aria-labelledby="theme-title">
        <div className={styles.sectionHeading}>
          <span>
            <IconMoonStars size={18} aria-hidden="true" />
          </span>
          <div>
            <h3 id="theme-title">Theme</h3>
            <p>Match your device or choose a fixed appearance.</p>
          </div>
        </div>
        <Field
          label="Display mode"
          description="Use your device setting, light mode, or dark mode."
        >
          <Segment
            value={preferences.theme}
            disabled={!ready}
            options={["system", "light", "dark"]}
            onChange={(theme) =>
              update({ theme: theme as typeof preferences.theme })
            }
          />
        </Field>
      </section>
      <section id="accessibility" aria-labelledby="accessibility-title">
        <div className={styles.sectionHeading}>
          <span><IconMoonStars size={18} aria-hidden="true" /></span>
          <div><h3 id="accessibility-title">Reading comfort</h3><p>Keep navigation solid when transparency makes reading harder.</p></div>
        </div>
        <Field label="Navigation material" description="Your device's reduced transparency setting is always respected.">
          <button className={styles.reset} type="button" disabled={!ready} aria-pressed={preferences.opaqueNavigation} onClick={() => update({ opaqueNavigation: !preferences.opaqueNavigation })}>
            {preferences.opaqueNavigation ? "Opaque navigation on" : "Use opaque navigation"}
          </button>
        </Field>
      </section>
      <section id="formatting" aria-labelledby="formatting-title">
        <div className={styles.sectionHeading}>
          <span>
            <IconCurrencyDollar size={18} aria-hidden="true" />
          </span>
          <div>
            <h3 id="formatting-title">Regional formatting</h3>
            <p>Choose how values are displayed.</p>
          </div>
        </div>
        <Field
          label="Display currency"
          description="Used throughout budgets, accounts, and reports."
        >
          <select
            aria-label="Display currency"
            disabled={!ready}
            value={preferences.currency}
            onChange={(event) => update({ currency: event.target.value })}
          >
            <option value="USD">USD , US Dollar</option>
            <option value="CAD">CAD , Canadian Dollar</option>
            <option value="EUR">EUR , Euro</option>
            <option value="GBP">GBP , British Pound</option>
          </select>
        </Field>
        <p className={styles.note}>This changes display formatting, not exchange rates.</p>
      </section>
    </>
  );
}

function Field({
  label,
  description,
  icon,
  children,
}: {
  label: string;
  description?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.field}>
      <span className={styles.fieldCopy}>
        {icon ? <i aria-hidden="true">{icon}</i> : null}
        <span>
          <strong>{label}</strong>
          {description ? <small>{description}</small> : null}
        </span>
      </span>
      {children}
    </div>
  );
}

function Segment({
  value,
  options,
  onChange,
  disabled,
}: {
  value: string;
  options: string[];
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className={styles.segment} role="group" aria-label="Display mode">
      {options.map((option) => (
        <button
          type="button"
          disabled={disabled}
          key={option}
          aria-pressed={value === option}
          onClick={() => onChange(option)}
        >
          <span>{option[0].toUpperCase() + option.slice(1)}</span>
        </button>
      ))}
    </div>
  );
}
