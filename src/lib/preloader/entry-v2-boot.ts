import { mountPreloader } from "./mount";
import { V2_THEME } from "./theme";

/**
 * v2 boot bundle — inlined into every page of the static mirror by
 * `scripts/build-v2-preloader.mjs`.
 *
 * Deliberately three-free: it is a couple of kilobytes of inline script that
 * puts the counter on screen straight away. `entry-v2-scene.ts` loads the
 * engine afterwards and upgrades the same overlay.
 */
mountPreloader({ theme: V2_THEME });
