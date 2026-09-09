"use client";

export default function AppError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <section className="card" role="alert" style={{ padding: 32 }}><h2>We couldn’t load your household data</h2><p>Check your connection and try again. Your saved data is still there.</p><button className="btn btn-primary" type="button" onClick={reset}>Try again</button></section>;
}
