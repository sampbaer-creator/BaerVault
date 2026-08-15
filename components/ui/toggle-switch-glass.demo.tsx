"use client";

import ToggleSwitch from "./toggle-switch-glass";

export default function ToggleSwitchGlassDemo() {
  return (
    <main className="grid min-h-screen gap-6 bg-[#f3f3f3] p-6 text-slate-950 sm:grid-cols-2 sm:p-10">
      <ThemeSample darkMode={false} />
      <ThemeSample darkMode />
    </main>
  );
}

function ThemeSample({ darkMode }: { darkMode: boolean }) {
  return (
    <section
      className={
        darkMode
          ? "grid min-h-72 place-content-center gap-8 rounded-3xl bg-[#17171c] p-8 text-white"
          : "grid min-h-72 place-content-center gap-8 rounded-3xl bg-white p-8 text-slate-950 shadow-sm"
      }
    >
      <h1 className="text-center text-sm font-semibold">
        {darkMode ? "Dark" : "Light"}
      </h1>
      <div className="flex items-center gap-8">
        <ToggleSwitch darkMode={darkMode} label="Inactive example" />
        <ToggleSwitch darkMode={darkMode} isActive label="Active example" />
      </div>
    </section>
  );
}
