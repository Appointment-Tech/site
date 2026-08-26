import { useEffect } from "react";

import { preloaderHtml } from "@/lib/preloader/markup";
import { mountPreloader } from "@/lib/preloader/mount";
import { V1_THEME } from "@/lib/preloader/theme";

/**
 * Loading screen of v1.
 *
 * The markup is server-rendered (same string v2 injects), so the red screen,
 * the logo and a `0%` are painted before any JavaScript runs. The effect then
 * takes over: it counts the real progress and pulls three in as a separate
 * chunk for the WebGL ring.
 */
export function Preloader() {
  useEffect(() => {
    const handle = mountPreloader({
      theme: V1_THEME,
      loadThree: () => import("three"),
    });
    return () => handle.dispose();
  }, []);

  return (
    <div
      style={{ display: "contents" }}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: preloaderHtml(V1_THEME) }}
    />
  );
}
