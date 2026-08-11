"use client";

export default function AppError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <section style={{ padding: 32, border: "1px solid var(--app-border)", borderRadius: 16, background: "var(--app-surface)" }}><h2>We couldn’t load your household data</h2><p style={{ color: "var(--app-text-muted)" }}>Check that the Supabase migration and Clerk third-party authentication integration are configured, then try again.</p><button type="button" onClick={reset} style={{ padding: "10px 16px", border: 0, borderRadius: 9, color: "white", background: "var(--app-accent)", cursor: "pointer" }}>Try again</button></section>;
}
