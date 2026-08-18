type TransitionDocument = Document & {
  startViewTransition: (callback: () => Promise<void> | void) => {
    finished: Promise<void>;
  };
};

type MobileRouter = {
  prefetch: (href: string) => void;
  push: (href: string) => void;
};

const MOBILE_QUERY = "(max-width: 47.999rem)";
const READY_TIMEOUT_MS = 12_000;

function routeIsReady(href: string) {
  const destination = new URL(href, window.location.href);
  return (
    window.location.pathname === destination.pathname &&
    !document.querySelector("[data-route-loading]")
  );
}

function waitForRouteReady(href: string) {
  return new Promise<void>((resolve) => {
    let settled = false;
    let readinessTimer = 0;

    const finish = () => {
      if (settled) return;
      settled = true;
      observer.disconnect();
      window.clearTimeout(timeout);
      window.clearTimeout(readinessTimer);
      resolve();
    };

    const check = () => {
      if (!routeIsReady(href)) return;
      // View Transition update callbacks pause painting, so use a task instead
      // of requestAnimationFrame to let React commit the completed route.
      readinessTimer = window.setTimeout(() => {
        if (routeIsReady(href)) finish();
      }, 0);
    };

    const observer = new MutationObserver(check);
    observer.observe(document.body, { childList: true, subtree: true });
    const timeout = window.setTimeout(finish, READY_TIMEOUT_MS);
    check();
  });
}

export function navigateMobileRoute(
  router: MobileRouter,
  href: string,
  direction: "left" | "right",
  reduceMotion: boolean,
) {
  router.prefetch(href);

  if (
    reduceMotion ||
    !window.matchMedia(MOBILE_QUERY).matches ||
    !("startViewTransition" in document)
  ) {
    router.push(href);
    return;
  }

  document.documentElement.dataset.swipeDirection = direction;
  const transition = (document as TransitionDocument).startViewTransition(async () => {
    router.push(href);
    await waitForRouteReady(href);
  });

  void transition.finished.finally(() => {
    delete document.documentElement.dataset.swipeDirection;
  });
}
