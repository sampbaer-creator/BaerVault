export const financePalettes = {
  "vault-green": { name: "Vault Green", mood: "Secure and optimistic", colors: ["#0E3B2E", "#1F6F54", "#5FB88A", "#D7E7DD", "#F6FBF7"] },
  "ledger-navy": { name: "Ledger Navy", mood: "Trusted and structured", colors: ["#0B1F3B", "#123A63", "#2F5D8C", "#C9D6E5", "#F2F5F8"] },
  "copper-audit": { name: "Copper Audit", mood: "Grounded and premium", colors: ["#2C2A28", "#6B5A4D", "#B87333", "#E7D4C2", "#FBF4EE"] },
  "platinum-statement": { name: "Platinum Statement", mood: "Clean and executive", colors: ["#0F172A", "#4B5563", "#9CA3AF", "#E5E7EB", "#FFFFFF"] },
  "sandstone-budget": { name: "Sandstone Budget", mood: "Approachable and steady", colors: ["#3A2F2A", "#7A6A5A", "#C2B59B", "#E8E1D4", "#FAF7F1"] },
  "midnight-spreadsheet": { name: "Midnight Spreadsheet", mood: "Focused and high-tech", colors: ["#0A0F1E", "#1B2A41", "#3B82F6", "#94A3B8", "#E2E8F0"] },
  "emerald-equity": { name: "Emerald Equity", mood: "Fresh and growth-minded", colors: ["#052E2B", "#0F766E", "#34D399", "#A7F3D0", "#ECFDF5"] },
  "graphite-reserve": { name: "Graphite Reserve", mood: "Serious and dependable", colors: ["#111827", "#374151", "#6B7280", "#D1D5DB", "#F9FAFB"] },
  "champagne-dividend": { name: "Champagne Dividend", mood: "Upscale and celebratory", colors: ["#2B2A28", "#6B6258", "#C9A86A", "#EFE2C8", "#FFF9EF"] },
  "teal-treasury": { name: "Teal Treasury", mood: "Modern and confident", colors: ["#082F49", "#0E7490", "#22C55E", "#BAE6FD", "#F0FDFF"] },
  "charcoal-compliance": { name: "Charcoal Compliance", mood: "Authoritative and clear", colors: ["#0B0F14", "#24303E", "#64748B", "#CBD5E1", "#F8FAFC"] },
  "bluechip-slate": { name: "Bluechip Slate", mood: "Stable and forward-looking", colors: ["#0F1B2D", "#1E3A8A", "#60A5FA", "#E0F2FE", "#F8FAFF"] },
  "olive-bond": { name: "Olive Bond", mood: "Heritage and calm", colors: ["#1F2A1E", "#3E5A3C", "#8AAE6D", "#DCE6D6", "#F6FAF3"] },
  "rose-gold-forecast": { name: "Rose Gold Forecast", mood: "Premium and personable", colors: ["#2A1F25", "#7A4B57", "#D08C9B", "#F1D6DC", "#FFF6F8"] },
  "indigo-ledgerlines": { name: "Indigo Ledgerlines", mood: "Smart and analytical", colors: ["#141B3A", "#2B3A8C", "#7C83FD", "#C7D2FE", "#F5F6FF"] },
  "silver-interest": { name: "Silver Interest", mood: "Precise and modern", colors: ["#0B1220", "#334155", "#94A3B8", "#E2E8F0", "#FFFFFF"] },
  "cocoa-capital": { name: "Cocoa Capital", mood: "Warm and established", colors: ["#1F1410", "#4B2E24", "#8B5E34", "#D6C2AE", "#F7F1EA"] },
  "cloudy-cashflow": { name: "Cloudy Cashflow", mood: "Calm and readable", colors: ["#0F172A", "#475569", "#A8B3C5", "#E6EDF7", "#F9FBFF"] },
  "burgundy-benchmark": { name: "Burgundy Benchmark", mood: "Bold and decisive", colors: ["#1F0D12", "#5B1A2B", "#9F2D45", "#E7C6CF", "#FFF5F7"] },
  "sunrise-yield": { name: "Sunrise Yield", mood: "Energizing and optimistic", colors: ["#1A1A1A", "#3A3A3A", "#F2B705", "#F6D365", "#FFF3D6"] },
  "harbor-balance": { name: "Harbor Balance", mood: "Calm and trustworthy", colors: ["#061A24", "#0B3A53", "#0FA3B1", "#B5E2FA", "#F3FAFF"] },
  "gilded-portfolio": { name: "Gilded Portfolio", mood: "Luxury and composed", colors: ["#101418", "#2C3E50", "#B08D57", "#DCC9A6", "#FBF6EE"] },
} as const;

export type FinancePaletteId = keyof typeof financePalettes;

export const financePaletteIds = Object.keys(financePalettes) as FinancePaletteId[];

export function isFinancePaletteId(value: unknown): value is FinancePaletteId {
  return typeof value === "string" && financePaletteIds.includes(value as FinancePaletteId);
}

export function paletteVariables(paletteId: FinancePaletteId, dark: boolean) {
  const [deep, mid, accent, tint, canvas] = financePalettes[paletteId].colors;
  const darkAccent = `color-mix(in srgb, ${accent} 58%, white)`;
  const common = {
    "--brand-gold": accent,
    "--brand-gold-bright": accent,
    "--app-danger": "#B84352",
    "--chart-tertiary": tint,
  };

  if (dark) {
    return {
      ...common,
      "--brand-green": "#79D4A5",
      "--money-positive": "#79D4A5",
      "--money-negative": "#FF9AA6",
      "--chart-primary": darkAccent,
      "--chart-secondary": tint,
      "--brand-navy": canvas,
      "--brand-gold-soft": `color-mix(in srgb, ${accent} 18%, ${deep})`,
      "--app-background": deep,
      "--app-surface": `color-mix(in srgb, ${mid} 32%, ${deep})`,
      "--app-surface-raised": `color-mix(in srgb, ${mid} 48%, ${deep})`,
      "--app-border": `color-mix(in srgb, ${tint} 28%, ${deep})`,
      "--app-hover": `color-mix(in srgb, ${mid} 62%, ${deep})`,
      "--app-text-strong": canvas,
      "--app-text-muted": tint,
      "--app-accent": darkAccent,
      "--app-accent-soft": `color-mix(in srgb, ${accent} 18%, ${deep})`,
      "--app-focus": darkAccent,
    };
  }

  return {
    ...common,
    "--brand-green": "#16834F",
    "--money-positive": "#16834F",
    "--money-negative": "#B84352",
    "--chart-primary": mid,
    "--chart-secondary": accent,
    "--brand-navy": deep,
    "--brand-gold-soft": tint,
    "--app-background": canvas,
    "--app-surface": `color-mix(in srgb, white 88%, ${canvas})`,
    "--app-surface-raised": `color-mix(in srgb, ${tint} 58%, ${canvas})`,
    "--app-border": `color-mix(in srgb, ${tint} 78%, ${deep})`,
    "--app-hover": tint,
    "--app-text-strong": deep,
    "--app-text-muted": `color-mix(in srgb, ${mid} 72%, ${deep})`,
    "--app-accent": mid,
    "--app-accent-soft": tint,
    "--app-focus": mid,
  };
}
