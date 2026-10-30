// Emit real route documents so Pages deep links return 200 with useful HTML and metadata.
import { build } from "esbuild";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
const out = resolve("dist/public");
const base = process.env.VITE_BASE || "/";
const modulePath = resolve("node_modules/.cache/portfolio-prerender.mjs");
await build({
  entryPoints: ["client/src/prerender.tsx"],
  outfile: modulePath,
  bundle: true,
  platform: "node",
  format: "esm",
  packages: "external",
  jsx: "automatic",
  define: { "import.meta.env.BASE_URL": JSON.stringify(base) },
});
const { render, pages, legacyPaths, origin, pageMetadata } = await import(
  pathToFileURL(modulePath).href
);
const template = readFileSync(resolve(out, "index.html"), "utf8");
const escape = s =>
  s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
for (const path of [...Object.keys(pages), ...legacyPaths]) {
  const meta = pageMetadata(path);
  let html = template.replace(
    '<div id="root"></div>',
    '<div id="root">' + render(path) + "</div>"
  );
  html = html.replace(
    /<title>.*?<\/title>/,
    "<title>" + escape(meta.title) + "</title>"
  );
  html = html.replace(
    /(<meta[^>]*(?:name="description"|property="og:description"|name="twitter:description")[^>]*content=")[^"]*"/g,
    "$1" + escape(meta.description) + '"'
  );
  html = html.replace(
    /(<meta[^>]*(?:property="og:title"|name="twitter:title")[^>]*content=")[^"]*"/g,
    "$1" + escape(meta.title) + '"'
  );
  html = html
    .replace(/(<link rel="canonical" href=")[^"]*"/, "$1" + origin + path + '"')
    .replace(
      /(<meta property="og:url" content=")[^"]*"/,
      "$1" + origin + path + '"'
    );
  const folder = resolve(out, "." + path);
  mkdirSync(folder, { recursive: true });
  writeFileSync(resolve(folder, "index.html"), html);
}
writeFileSync(
  resolve(out, "404.html"),
  template.replace("</head>", '<meta name="robots" content="noindex" /></head>')
);
writeFileSync(
  resolve(out, "sitemap.xml"),
  '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
    Object.keys(pages)
      .filter(p => p !== "/experience")
      .map(p => "<url><loc>" + origin + p + "</loc></url>")
      .join("") +
    "</urlset>"
);
console.log(
  "Prerendered",
  Object.keys(pages).length + legacyPaths.length,
  "routes; generated sitemap and SPA fallback."
);
