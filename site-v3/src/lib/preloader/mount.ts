import {
  PRELOADER_ID,
  PRELOADER_STYLE_ID,
  PRELOADING_CLASS,
  PRELOADING_DONE_CLASS,
  preloaderCss,
  preloaderHtml,
} from "./markup";
import { createProgressTracker } from "./progress";
import { createPreloaderScene, type PreloaderScene } from "./scene";
import type { PreloaderTheme } from "./theme";

import type * as THREE_NS from "three";

/**
 * Drives the loading screen: reads the real progress, animates the counter,
 * hands the same number to the WebGL scene and tears everything down once the
 * page is actually loaded.
 *
 * Works with or without markup already in the document. v1 server-renders the
 * overlay; v2 lets this function create it. Either way the element, the CSS
 * and the numbers come from the same code.
 */

/** Nothing shorter than this, so a warm cache doesn't produce a red blink. */
const MIN_DURATION_MS = 700;
const FADE_MS = 520;
const HOLD_AT_100_MS = 260;

export type PreloaderHandle = {
  /** Resolves once the overlay is gone. */
  done: Promise<void>;
  /**
   * Hands three to the loading screen once it is downloaded. v1 goes through
   * the `loadThree` option; v2 calls this from its separate scene bundle.
   */
  attachScene(THREE: typeof THREE_NS): void;
  /** Removes the overlay immediately (used when the host unmounts). */
  dispose(): void;
};

export type MountPreloaderOptions = {
  theme: PreloaderTheme;
  /** Lazy three loader. Omitted or failing: the CSS bar carries the progress. */
  loadThree?: () => Promise<typeof THREE_NS>;
  minDurationMs?: number;
};

declare global {
  interface Window {
    __apptPreloader?: PreloaderHandle;
  }
}

export function mountPreloader(options: MountPreloaderOptions): PreloaderHandle {
  const existing = window.__apptPreloader;
  if (existing) return existing;

  const { theme, minDurationMs = MIN_DURATION_MS } = options;
  const root = document.documentElement;

  ensureStyle(theme);
  root.classList.add(PRELOADING_CLASS);

  // Locking the scroll imperatively as well as through the class: the class
  // lives on <html>, which React also renders, and the loader must not depend
  // on hydration leaving it alone.
  const previousOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";

  const overlay = ensureOverlay(theme);
  const canvas = overlay.querySelector<HTMLCanvasElement>("canvas");
  const numberEl = overlay.querySelector<HTMLElement>("[data-appt-pl-num]");
  const logo = overlay.querySelector<HTMLImageElement>("img");

  fadeInLogo(logo);

  const tracker = createProgressTracker();
  let scene: PreloaderScene | null = null;
  let sceneDisposed = false;

  function attachScene(THREE: typeof THREE_NS): void {
    if (!canvas || scene || sceneDisposed || finished) return;
    scene = createPreloaderScene(THREE, canvas, theme);
    if (scene) overlay.classList.add("is-3d");
  }

  options.loadThree?.().then(attachScene, () => {
    // WebGL or the chunk is unavailable — the CSS bar stays in charge.
  });

  const startedAt = performance.now();
  let previousFrameAt = startedAt;
  let display = 0;
  let lastPainted = -1;
  let lastAnnounced = -1;
  let frame = 0;
  let finished = false;

  let resolveDone: () => void = () => {};
  const done = new Promise<void>((resolve) => {
    resolveDone = resolve;
  });

  function paint(value: number): void {
    overlay.style.setProperty("--appt-pl-p", value.toFixed(4));

    const percent = Math.floor(value * 100);
    if (percent !== lastPainted) {
      lastPainted = percent;
      if (numberEl) numberEl.textContent = String(percent);
    }
    // Screen readers get milestones, not sixty updates a second.
    const announced = Math.floor(percent / 5) * 5;
    if (announced !== lastAnnounced) {
      lastAnnounced = announced;
      overlay.setAttribute("aria-valuenow", String(announced));
    }
  }

  function tick(): void {
    frame = requestAnimationFrame(tick);

    const at = performance.now();
    const delta = at - previousFrameAt;
    previousFrameAt = at;

    const snapshot = tracker.read();
    // Frame-rate independent easing towards the measured progress.
    const rate = snapshot.complete ? 9 : 3.5;
    display = Math.max(
      display,
      display + (snapshot.value - display) * (1 - Math.exp((-rate * delta) / 1000)),
    );

    paint(display);
    scene?.setProgress(display);
    scene?.render(delta);

    if (snapshot.complete && display >= 0.999 && at - startedAt >= minDurationMs) finish();
  }

  function finish(): void {
    if (finished) return;
    finished = true;

    display = 1;
    paint(1);
    scene?.setProgress(1);

    window.setTimeout(() => {
      overlay.classList.add("is-done");
      root.classList.add(PRELOADING_DONE_CLASS);
      window.setTimeout(teardown, FADE_MS);
    }, HOLD_AT_100_MS);
  }

  function teardown(): void {
    cancelAnimationFrame(frame);
    tracker.dispose();
    sceneDisposed = true;
    scene?.dispose();
    scene = null;

    overlay.remove();
    document.body.style.overflow = previousOverflow;
    root.classList.remove(PRELOADING_CLASS, PRELOADING_DONE_CLASS);
    document.getElementById(PRELOADER_STYLE_ID)?.remove();

    if (window.__apptPreloader === handle) delete window.__apptPreloader;
    window.dispatchEvent(new CustomEvent("appt:preloader-done"));
    resolveDone();
  }

  frame = requestAnimationFrame(tick);

  const handle: PreloaderHandle = {
    done,
    attachScene,
    dispose(): void {
      finished = true;
      teardown();
    },
  };

  window.__apptPreloader = handle;
  return handle;
}

function ensureStyle(theme: PreloaderTheme): void {
  if (document.getElementById(PRELOADER_STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = PRELOADER_STYLE_ID;
  style.textContent = preloaderCss(theme);
  document.head.appendChild(style);
}

function ensureOverlay(theme: PreloaderTheme): HTMLElement {
  const found = document.getElementById(PRELOADER_ID);
  if (found) return found;

  const holder = document.createElement("div");
  holder.innerHTML = preloaderHtml(theme);
  const overlay = holder.firstElementChild as HTMLElement;
  document.body.appendChild(overlay);
  return overlay;
}

function fadeInLogo(logo: HTMLImageElement | null): void {
  if (!logo) return;
  if (logo.complete) {
    logo.classList.add("is-in");
    return;
  }
  logo.addEventListener("load", () => logo.classList.add("is-in"), { once: true });
  logo.addEventListener("error", () => logo.classList.add("is-in"), { once: true });
}
