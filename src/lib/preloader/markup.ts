import type { PreloaderTheme } from "./theme";

/** Class on <html> while the loading screen is up. */
export const PRELOADING_CLASS = "appt-preloading";
/** Added next to PRELOADING_CLASS during the fade-out. */
export const PRELOADING_DONE_CLASS = "appt-preloading-done";
/** Id of the overlay element and of the <style> that paints it. */
export const PRELOADER_ID = "appt-preloader";
export const PRELOADER_STYLE_ID = "appt-preloader-style";

function escapeAttribute(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

/**
 * Critical CSS for the loading screen.
 *
 * The red comes from `html.appt-preloading::before`, not from the overlay
 * element: a pseudo-element on the root paints on the very first frame, before
 * the body is parsed and without waiting for a single line of JavaScript, so
 * the site never flashes its content before the loader covers it. The overlay
 * (canvas + counter) layers on top of that red and repeats the same gradient,
 * so it still covers the page if anything ever strips the root class.
 */
export function preloaderCss(theme: PreloaderTheme): string {
  return `
.${PRELOADING_CLASS}, .${PRELOADING_CLASS} body { overflow: hidden !important; }
.${PRELOADING_CLASS}::before {
  content: "";
  position: fixed;
  inset: 0;
  z-index: 2147483646;
  background:
    radial-gradient(120% 120% at 50% 42%, ${theme.background} 0%, ${theme.backgroundDeep} 100%);
  opacity: 1;
  transition: opacity 480ms ease;
}
.${PRELOADING_CLASS}.${PRELOADING_DONE_CLASS}::before { opacity: 0; }

#${PRELOADER_ID} {
  position: fixed;
  inset: 0;
  z-index: 2147483647;
  display: flex;
  align-items: center;
  justify-content: center;
  background:
    radial-gradient(120% 120% at 50% 42%, ${theme.background} 0%, ${theme.backgroundDeep} 100%);
  color: ${theme.foreground};
  font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial,
    sans-serif;
  opacity: 1;
  transition: opacity 480ms ease, transform 480ms ease;
  --appt-pl-p: 0;
  --appt-pl-r: 140px;
}
#${PRELOADER_ID}.is-done {
  opacity: 0;
  transform: scale(1.03);
  pointer-events: none;
}
#${PRELOADER_ID} .appt-pl__canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
}
#${PRELOADER_ID} .appt-pl__center {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  width: min(70vw, calc(var(--appt-pl-r) * 1.25));
  text-align: center;
}
#${PRELOADER_ID} .appt-pl__logo {
  width: clamp(48px, 12vmin, 78px);
  height: auto;
  opacity: 0;
  transform: translateY(6px);
  transition: opacity 600ms ease, transform 600ms ease;
}
#${PRELOADER_ID} .appt-pl__logo.is-in { opacity: 1; transform: none; }
#${PRELOADER_ID} .appt-pl__count {
  margin: 0;
  font-size: clamp(2.25rem, 9vmin, 3.5rem);
  font-weight: 700;
  line-height: 1;
  letter-spacing: -0.03em;
  font-variant-numeric: tabular-nums;
  font-feature-settings: "tnum" 1;
}
#${PRELOADER_ID} .appt-pl__pct {
  font-size: 0.45em;
  font-weight: 600;
  margin-left: 0.15em;
  opacity: 0.7;
  vertical-align: 0.35em;
}
#${PRELOADER_ID} .appt-pl__track {
  width: 100%;
  height: 2px;
  border-radius: 2px;
  background: currentColor;
  opacity: 0.18;
  overflow: hidden;
  transition: opacity 500ms ease;
}
#${PRELOADER_ID}.is-3d .appt-pl__track { opacity: 0; }
#${PRELOADER_ID} .appt-pl__bar {
  display: block;
  width: 100%;
  height: 100%;
  background: currentColor;
  transform: scaleX(var(--appt-pl-p));
  transform-origin: left center;
}
#${PRELOADER_ID} .appt-pl__label {
  margin: 0;
  font-size: clamp(0.6rem, 2.4vmin, 0.72rem);
  font-weight: 600;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  opacity: 0.62;
}
@media (prefers-reduced-motion: reduce) {
  #${PRELOADER_ID}, #${PRELOADER_ID} .appt-pl__logo { transition-duration: 1ms; }
}
`.trim();
}

/**
 * Overlay markup. v1 server-renders this string (so it is already on screen
 * before hydration); v2 has no source to render from, so its inline boot
 * script injects the exact same string. One source, two versions.
 */
export function preloaderHtml(theme: PreloaderTheme): string {
  return `<div id="${PRELOADER_ID}" class="appt-pl" role="progressbar" aria-label="Carregando o site" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><canvas class="appt-pl__canvas" aria-hidden="true"></canvas><div class="appt-pl__center" aria-hidden="true"><img class="appt-pl__logo" src="${escapeAttribute(
    theme.logoSrc,
  )}" alt="" decoding="async" fetchpriority="high" /><p class="appt-pl__count"><span data-appt-pl-num>0</span><span class="appt-pl__pct">%</span></p><div class="appt-pl__track"><span class="appt-pl__bar" data-appt-pl-bar></span></div><p class="appt-pl__label">${escapeAttribute(
    theme.label,
  )}</p></div></div>`;
}

/**
 * Escape hatch for JavaScript-disabled browsers: without it the red
 * pseudo-element would cover the site forever, since only JS ever removes it.
 */
export const PRELOADER_NOSCRIPT_CSS = `.${PRELOADING_CLASS}, .${PRELOADING_CLASS} body { overflow: auto !important; }
.${PRELOADING_CLASS}::before { display: none !important; }
#${PRELOADER_ID} { display: none !important; }`;
