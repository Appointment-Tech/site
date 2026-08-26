/**
 * Progress of "everything the page needs", expressed as 0..1.
 *
 * The number is built from real signals, never from a timer alone:
 *
 *  - `resources` — how many of the assets the document declares (stylesheets,
 *    module preloads, scripts, images) already show up in the Resource Timing
 *    buffer. The expected set is re-scanned while loading, because hydration
 *    adds images that the server HTML never mentioned.
 *  - `dom` / `fonts` / `load` — DOMContentLoaded, `document.fonts.ready` and
 *    the window `load` event, each worth a fixed slice.
 *
 * 100% is only reached once every gate is closed (or the safety timeout
 * fires), so the counter cannot claim the site is ready while an image is
 * still coming down the wire.
 */

const WEIGHTS = { dom: 0.08, resources: 0.62, fonts: 0.1, load: 0.2 } as const;

/** Nothing keeps a visitor behind the loader for longer than this. */
const DEFAULT_TIMEOUT_MS = 12_000;

/** How often the expected-asset scan is redone. */
const RESCAN_INTERVAL_MS = 200;

/** Ceiling for the "we are not frozen" creep while a slow asset is pending. */
const MAX_CREEP = 0.05;

/**
 * After `load`, how long a still-running request may hold the counter back.
 * Past this the page is treated as ready — a straggler must not keep a visitor
 * staring at the loading screen.
 */
const POST_LOAD_GRACE_MS = 2_500;

const ASSET_SELECTOR = [
  "link[rel=stylesheet][href]",
  "link[rel=preload][href]",
  "link[rel=modulepreload][href]",
  "script[src]",
  // `loading=lazy` images are deliberately left out: the browser may never
  // fetch an off-screen one (and the loader locks the scroll, so it never
  // will), which would freeze the counter until the safety timeout.
  "img[src]:not([loading=lazy])",
  "source[src]",
].join(",");

export type ProgressSnapshot = {
  /** Raw, un-smoothed progress in 0..1. */
  value: number;
  /** Every load gate closed (or the safety timeout fired). */
  complete: boolean;
};

export type ProgressTracker = {
  read(): ProgressSnapshot;
  dispose(): void;
};

export function createProgressTracker(timeoutMs: number = DEFAULT_TIMEOUT_MS): ProgressTracker {
  const startedAt = now();

  let domReady = document.readyState !== "loading";
  let fontsReady = false;
  let windowLoaded = document.readyState === "complete";
  let loadedAt = windowLoaded ? startedAt : 0;

  let expected = new Set<string>();
  let lastScanAt = 0;
  let resourceRatio = 0;

  let lastValue = 0;
  let lastMoveAt = startedAt;

  const onDomReady = () => {
    domReady = true;
  };
  const onLoad = () => {
    windowLoaded = true;
    loadedAt = now();
  };

  document.addEventListener("DOMContentLoaded", onDomReady);
  window.addEventListener("load", onLoad);

  // Some engines resolve fonts.ready only after layout; treat a missing API as
  // "nothing to wait for" instead of blocking the counter at 90%.
  const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
  if (fonts?.ready) {
    fonts.ready.then(
      () => {
        fontsReady = true;
      },
      () => {
        fontsReady = true;
      },
    );
  } else {
    fontsReady = true;
  }

  function rescan(at: number): void {
    if (at - lastScanAt < RESCAN_INTERVAL_MS) return;
    lastScanAt = at;

    const next = new Set(expected);
    for (const node of document.querySelectorAll<HTMLElement>(ASSET_SELECTOR)) {
      const raw = node.getAttribute("href") ?? node.getAttribute("src");
      if (!raw || raw.startsWith("data:")) continue;
      try {
        next.add(new URL(raw, document.baseURI).href);
      } catch {
        // Malformed URL in the markup — not something the loader should die on.
      }
    }
    expected = next;

    if (expected.size === 0) {
      resourceRatio = 1;
      return;
    }

    const done = new Set<string>();
    for (const entry of performance.getEntriesByType("resource")) {
      if (expected.has(entry.name)) done.add(entry.name);
    }
    // An <img> served from the memory cache can miss the timing buffer.
    for (const img of document.images) {
      if (img.complete && img.currentSrc) done.add(img.currentSrc);
    }

    // Monotonic: a freshly discovered asset must not drag the bar backwards.
    resourceRatio = Math.max(resourceRatio, Math.min(1, done.size / expected.size));
  }

  /**
   * Images the browser is actually downloading right now. An <img> that has
   * not started (no `currentSrc`) is either lazy and off-screen or deferred by
   * the browser — waiting on it would never end.
   */
  function imagesInFlight(): number {
    let count = 0;
    for (const img of document.images) {
      if (!img.complete && img.currentSrc) count += 1;
    }
    return count;
  }

  return {
    read(): ProgressSnapshot {
      const at = now();
      rescan(at);

      const inFlight = imagesInFlight();
      // `load` means the browser finished everything it decided to fetch, so
      // anything still unaccounted for in the scan is never coming.
      if (windowLoaded && inFlight === 0) resourceRatio = 1;

      const timedOut = at - startedAt >= timeoutMs;
      const gatesClosed =
        domReady &&
        windowLoaded &&
        fontsReady &&
        (inFlight === 0 || at - loadedAt >= POST_LOAD_GRACE_MS);
      const complete = timedOut || gatesClosed;

      let value =
        (domReady ? WEIGHTS.dom : 0) +
        (fontsReady ? WEIGHTS.fonts : 0) +
        (windowLoaded ? WEIGHTS.load : 0) +
        WEIGHTS.resources * resourceRatio;

      if (value > lastValue + 0.0005) {
        lastValue = value;
        lastMoveAt = at;
      } else {
        // Held still for a while: creep forward a little so the counter reads
        // as "working", capped so it never overtakes the real signals.
        const stalledFor = at - lastMoveAt - 500;
        const creep = stalledFor > 0 ? Math.min(MAX_CREEP, stalledFor / 20_000) : 0;
        value = lastValue + creep;
      }

      return { value: complete ? 1 : Math.min(0.99, value), complete };
    },

    dispose(): void {
      document.removeEventListener("DOMContentLoaded", onDomReady);
      window.removeEventListener("load", onLoad);
    },
  };
}

function now(): number {
  return performance.now();
}
