#!/usr/bin/env node
/**
 * Builds the loading screen into the v2 static mirror.
 *
 * v2 has no source tree (see site-v2/README.md) — it is pre-rendered HTML. So
 * instead of a component, the same TypeScript that drives v1 is bundled here
 * and written into the mirror:
 *
 *   - the boot bundle (no three) is inlined in every page, right before
 *     </body>, so the counter starts without an extra request;
 *   - `site-v2/preloader/scene.js` carries three and upgrades that same
 *     overlay to WebGL when it arrives;
 *   - the critical CSS goes inline in <head>, next to the one-liner that puts
 *     the red screen up on the first frame.
 *
 * Run it after touching anything under src/lib/preloader:
 *
 *   npm run build:v2-preloader
 *
 * The output is committed, exactly like the rest of the mirror.
 */
import { readFile, writeFile, mkdir, readdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import * as esbuild from "esbuild";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const mirrorDir = join(root, "site-v2");
const outDir = join(mirrorDir, "preloader");

const HEAD_START = "<!--appt-preloader:head-->";
const HEAD_END = "<!--/appt-preloader:head-->";
const BODY_START = "<!--appt-preloader:body-->";
const BODY_END = "<!--/appt-preloader:body-->";

const shared = {
  bundle: true,
  minify: true,
  target: ["es2019"],
  legalComments: "none",
  logLevel: "warning",
};

/** Bundle + evaluate the theme/markup modules so the CSS has a single source. */
async function loadMarkupModule() {
  const built = await esbuild.build({
    stdin: {
      contents: `export { preloaderCss, PRELOADER_NOSCRIPT_CSS, PRELOADER_STYLE_ID } from "./src/lib/preloader/markup";
export { V2_THEME } from "./src/lib/preloader/theme";`,
      resolveDir: root,
      loader: "ts",
    },
    bundle: true,
    format: "esm",
    platform: "node",
    write: false,
  });
  const [output] = built.outputFiles;
  const encoded = Buffer.from(output.text).toString("base64");
  return import(`data:text/javascript;base64,${encoded}`);
}

async function bundle(entry, format) {
  const built = await esbuild.build({
    ...shared,
    entryPoints: [join(root, entry)],
    format,
    write: false,
  });
  return built.outputFiles[0].text;
}

/** `</script>` inside an inline script would close the tag early. */
function escapeInlineScript(code) {
  return code.replace(/<\/script/gi, "<\\/script");
}

function stripBlock(html, start, end) {
  const from = html.indexOf(start);
  if (from === -1) return html;
  const to = html.indexOf(end, from);
  if (to === -1) return html;
  return html.slice(0, from) + html.slice(to + end.length);
}

function injectBefore(html, tag, block) {
  const at = html.lastIndexOf(tag);
  if (at === -1) throw new Error(`missing ${tag}`);
  return html.slice(0, at) + block + html.slice(at);
}

async function main() {
  const { preloaderCss, PRELOADER_NOSCRIPT_CSS, PRELOADER_STYLE_ID, V2_THEME } =
    await loadMarkupModule();

  const [bootJs, sceneJs] = await Promise.all([
    bundle("src/lib/preloader/entry-v2-boot.ts", "iife"),
    bundle("src/lib/preloader/entry-v2-scene.ts", "esm"),
  ]);

  await mkdir(outDir, { recursive: true });
  await writeFile(join(outDir, "scene.js"), sceneJs, "utf8");

  const css = (await esbuild.transform(preloaderCss(V2_THEME), { loader: "css", minify: true }))
    .code;
  const headBlock = [
    HEAD_START,
    `<style id="${PRELOADER_STYLE_ID}">${css}</style>`,
    // Adding the class from script (not from the <html> tag) keeps it out of
    // reach of React's hydration of the mirrored document.
    `<script>document.documentElement.classList.add("appt-preloading")</script>`,
    `<noscript><style>${PRELOADER_NOSCRIPT_CSS}</style></noscript>`,
    HEAD_END,
  ].join("");
  const bodyBlock = [
    BODY_START,
    `<script>${escapeInlineScript(bootJs)}</script>`,
    `<script type="module" src="preloader/scene.js"></script>`,
    BODY_END,
  ].join("");

  const pages = (await readdir(mirrorDir)).filter((name) => name.endsWith(".html"));
  for (const page of pages) {
    const file = join(mirrorDir, page);
    let html = await readFile(file, "utf8");
    html = stripBlock(html, HEAD_START, HEAD_END);
    html = stripBlock(html, BODY_START, BODY_END);
    html = injectBefore(html, "</head>", headBlock);
    html = injectBefore(html, "</body>", bodyBlock);
    await writeFile(file, html, "utf8");
  }

  const kb = (text) => `${(Buffer.byteLength(text) / 1024).toFixed(1)} kB`;
  console.log(`inline boot: ${kb(bootJs)} — injected into ${pages.length} pages`);
  console.log(`scene.js:    ${kb(sceneJs)} (three included)`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
