"use client";

import {
  IconAdjustmentsHorizontal,
  IconCurrencyDollar,
  IconMoonStars,
  IconPalette,
  IconRefresh,
} from "@tabler/icons-react";

import { usePreferences } from "@/components/preferences/PreferencesProvider";
import ToggleSwitch from "@/components/ui/toggle-switch-glass";
import { PaletteDropdown } from "./PaletteDropdown";
import styles from "./SettingsWorkspace.module.css";

export function PreferencesPanel() {
  const { preferences, update, reset } = usePreferences();
  return (
    <>
      <section id="appearance" aria-labelledby="appearance-title">
        <div className={styles.sectionHeading}>
          <span>
            <IconPalette size={18} aria-hidden="true" />
          </span>
          <div>
            <h3 id="appearance-title">Appearance</h3>
            <p>Make BearVault feel at home on this device.</p>
          </div>
        </div>
        <Field
          label="Color palette"
          description="Changes accents and supporting surfaces across the app."
        >
          <PaletteDropdown
            value={preferences.palette}
            onChange={(palette) => update({ palette })}
          />
        </Field>
        <Field
          label="Appearance"
          description="Follow your device or choose a fixed theme."
          icon={<IconMoonStars size={17} />}
        >
          <Segment
            value={preferences.theme}
            options={["light", "dark", "system"]}
            onChange={(theme) =>
              update({ theme: theme as typeof preferences.theme })
            }
          />
        </Field>
        <Field
          label="Content density"
          description="Adjust how much information fits on screen."
          icon={<IconAdjustmentsHorizontal size={17} />}
        >
          <Segment
            value={preferences.density}
            options={["comfortable", "compact"]}
            onChange={(density) =>
              update({ density: density as typeof preferences.density })
            }
          />
        </Field>
        <div className={styles.toggle}>
          <span>
            <strong>Reduce motion</strong>
            <small>Minimize non-essential transitions.</small>
          </span>
          <ToggleSwitch
            isActive={preferences.reducedMotion}
            onChange={(reducedMotion) => update({ reducedMotion })}
            size="sm"
            colorTheme="success"
            label="Reduce motion"
            reduceMotion={preferences.reducedMotion}
          />
        </div>
        <button className={styles.reset} type="button" onClick={reset}>
          <IconRefresh size={16} aria-hidden="true" />
          Reset appearance
        </button>
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
            value={preferences.currency}
            onChange={(event) => update({ currency: event.target.value })}
          >
            <option value="USD">USD — US Dollar</option>
            <option value="CAD">CAD — Canadian Dollar</option>
            <option value="EUR">EUR — Euro</option>
            <option value="GBP">GBP — British Pound</option>
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
}: {
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div className={styles.segment}>
      {options.map((option) => (
        <button
          type="button"
          key={option}
          aria-pressed={value === option}
          onClick={() => onChange(option)}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
