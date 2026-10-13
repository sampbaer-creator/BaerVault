declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

/**
 * Provider-agnostic event hook. Pushes to window.dataLayer (GA4/GTM convention) when
 * present; no-ops otherwise. No analytics provider is wired up yet (see PRODUCT.md) —
 * this just leaves CTA instrumentation in place for when one is connected.
 */
export function track(event: string, props?: Record<string, unknown>) {
  if (typeof window === "undefined" || !Array.isArray(window.dataLayer)) return;
  window.dataLayer.push({ event, ...props });
}
