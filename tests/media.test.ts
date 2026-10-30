import { it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
it("keeps the Fetch asset under 1 MB and supplies a valid binary glTF", () => {
  const model = readFileSync(
    "client/public/research/fetch/fetch-original-quality.glb"
  );
  expect(model.subarray(0, 4).toString()).toBe("glTF");
  expect(model.byteLength).toBeLessThan(1_000_000);
  const jsonLength = model.readUInt32LE(12);
  const gltf = JSON.parse(model.subarray(20, 20 + jsonLength).toString());
  expect(
    gltf.nodes.some((node: { name?: string }) => node.name === "head_pan_joint")
  ).toBe(true);
  expect(
    gltf.nodes.some(
      (node: { name?: string }) => node.name === "shoulder_lift_joint"
    )
  ).toBe(true);
  expect(gltf.extensionsRequired).toContain("KHR_draco_mesh_compression");
});
it("retains RPX attribution and the unchanged source hashes where applicable", () => {
  const manifest = JSON.parse(
    readFileSync("client/public/research/rpx/media-attribution.json", "utf8")
  );
  expect(manifest.license_url).toBe(
    "https://creativecommons.org/licenses/by/4.0/"
  );
  for (const source of manifest.assets) {
    expect(source.sha256).toMatch(/^[0-9a-f]{64}$/);
    for (const file of source.local_files)
      expect(existsSync("client/public/research/rpx/" + file)).toBe(true);
  }
  for (const [file, sourceName] of [
    ["toolkit-overview.svg", "toolkit-overview.svg"],
    ["overview-full.webp", "rpx-overview.webp"],
  ]) {
    const bytes = readFileSync("client/public/research/rpx/" + file);
    expect(createHash("sha256").update(bytes).digest("hex")).toBe(
      manifest.assets.find(
        (s: { source_file: string }) => s.source_file === sourceName
      ).sha256
    );
  }
});
it("renders the RPX page with a paused showcase and full-size figure links", () => {
  const html = readFileSync("dist/public/research/rpx/index.html", "utf8");
  expect(html).toContain("Play RPX showcase");
  expect(html).not.toContain("<video");
  expect(html).toContain("not frame-synchronized");
  expect(html).toContain("CC BY 4.0");
  expect(html).toContain("overview-full.webp");
});
