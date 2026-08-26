/**
 * Palette + copy for the loading screen. v1 and v2 share every line of the
 * preloader except these values: each version passes its own brand red so the
 * screen matches the site it belongs to.
 */
export type PreloaderTheme = {
  /** Full-screen background — the site's own red. */
  background: string;
  /** Darker red used for the vignette at the edges. */
  backgroundDeep: string;
  /** Text, ring and logo tint. */
  foreground: string;
  /** Warmer highlight for the particles and the arc head. */
  accent: string;
  /**
   * Logo shown at the center of the ring. A 220 px cut of the brand logo (the
   * full one is 1022 px / 273 kB, too heavy for the first screen):
   * `sharp("public/a-logo-final.png").resize({width:220}).png({palette:true})`.
   */
  logoSrc: string;
  /** Text under the counter. */
  label: string;
};

/** v1 — bordô do logo, `--primary: oklch(0.38 0.155 26)` in src/styles.css. */
export const V1_THEME: PreloaderTheme = {
  background: "#81000d",
  backgroundDeep: "#4a0007",
  foreground: "#fef9f4",
  accent: "#ffb4a4",
  logoSrc: "/preloader-logo.png",
  label: "Carregando",
};

/** v2 — `--appointment-primary: #902323` in site-v2/assets/styles-*.css. */
export const V2_THEME: PreloaderTheme = {
  background: "#902323",
  backgroundDeep: "#4a1212",
  foreground: "#ffffff",
  accent: "#f0a39c",
  logoSrc: "preloader/logo.png",
  label: "Carregando",
};
