import * as THREE from "three";

/**
 * v2 scene bundle — three plus the WebGL layer of the loading screen, loaded
 * as a deferred module so the counter never waits for it.
 *
 * The boot script runs inline earlier in the document, so the handle is
 * normally already there; the retry only covers a browser that reorders or
 * delays that script.
 */
const MAX_ATTEMPTS = 90;

function attach(attempt = 0): void {
  const handle = window.__apptPreloader;
  if (handle) {
    handle.attachScene(THREE);
    return;
  }
  if (attempt < MAX_ATTEMPTS) requestAnimationFrame(() => attach(attempt + 1));
}

attach();
