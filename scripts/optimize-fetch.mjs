// Offline preparation of the ORIGINAL Fetch visuals; not part of the site build.
// npm install --prefix /tmp/portfolio-model-tools @gltf-transform/core@4.5.1 @gltf-transform/extensions@4.5.1 @gltf-transform/functions@4.5.1 sharp@0.35.5 draco3dgltf@1.5.9
// Export /tmp/fetch-original.glb with export-fetch*.mjs, then run this script.
// The isolated tooling requires Node 22.12+. The site's build requirements are unchanged.
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { mkdirSync, statSync, writeFileSync } from "node:fs";
const modules =
  process.env.GLTF_TOOLS_DIR || "/tmp/portfolio-model-tools/node_modules";
const tool = path => import(pathToFileURL(resolve(modules, path)).href);
const { NodeIO } = await tool("@gltf-transform/core/dist/index.js");
const { ALL_EXTENSIONS } = await tool(
  "@gltf-transform/extensions/dist/index.js"
);
const { dedup, weld, prune, textureCompress, draco } = await tool(
  "@gltf-transform/functions/dist/index.js"
);
const { default: sharp } = await tool("sharp/dist/index.mjs");
const { default: draco3d } = await tool("draco3dgltf/draco3dgltf.js");
const input = process.argv[2] || "/tmp/fetch-original.glb";
const folder = "client/public/research/fetch",
  output = folder + "/fetch-original-quality.glb";
const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({
    "draco3d.encoder": await draco3d.createEncoderModule(),
  });
const document = await io.read(input);
// Keep geometry, normals, named joints and the original rest/wave articulation.
// No mesh simplification, normal deletion, rig flattening, or silhouette changes.
await document.transform(
  dedup(),
  weld(),
  prune({ keepLeaves: true }),
  textureCompress({
    encoder: sharp,
    targetFormat: "webp",
    resize: [512, 512],
    quality: 90,
  }),
  draco({
    method: "edgebreaker",
    encodeSpeed: 5,
    decodeSpeed: 5,
    quantizePosition: 14,
    quantizeNormal: 10,
    quantizeTexcoord: 12,
  })
);
mkdirSync(folder, { recursive: true });
await io.write(output, document);
const report = {
  source: "Original Fetch URDF visual meshes, existing portfolio assets",
  geometry: "Original geometry and normals preserved; no simplification",
  texture: "512px WebP, quality 90",
  compression: "Draco, position 14 bits, normal 10 bits",
  bytes: statSync(output).size,
};
writeFileSync(
  folder + "/optimization.json",
  JSON.stringify(report, null, 2) + "\n"
);
console.log(report);
