// Downsample the original studio lighting without changing dynamic range.
// Source: https://raw.githubusercontent.com/pmndrs/drei-assets/master/hdri/studio_small_03_1k.hdr
// Usage: node scripts/prepare-fetch-lighting.mjs /tmp/portfolio-studio.hdr
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { FloatType } from "three";
import { readFileSync, writeFileSync } from "node:fs";
const bytes = readFileSync(process.argv[2] || "/tmp/portfolio-studio.hdr");
const source = new RGBELoader()
  .setDataType(FloatType)
  .parse(
    bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength)
  );
const width = 256,
  height = 128,
  data = Buffer.alloc(width * height * 4),
  sx = source.width / width,
  sy = source.height / height;
for (let y = 0; y < height; y++)
  for (let x = 0; x < width; x++) {
    const rgb = [0, 0, 0];
    let count = 0;
    for (let j = 0; j < sy; j++)
      for (let i = 0; i < sx; i++) {
        const offset =
          (Math.floor(y * sy + j) * source.width + Math.floor(x * sx + i)) * 4;
        for (let c = 0; c < 3; c++) rgb[c] += source.data[offset + c];
        count++;
      }
    for (let c = 0; c < 3; c++) rgb[c] /= count;
    const peak = Math.max(...rgb),
      out = (y * width + x) * 4;
    if (peak < 1e-32) continue;
    const exponent = Math.ceil(Math.log2(peak)),
      scale = 256 / 2 ** exponent;
    for (let c = 0; c < 3; c++)
      data[out + c] = Math.min(255, Math.floor(rgb[c] * scale));
    data[out + 3] = exponent + 128;
  }
writeFileSync(
  "client/public/research/fetch/studio-256.hdr",
  Buffer.concat([
    Buffer.from(
      "#?RADIANCE\nFORMAT=32-bit_rle_rgbe\n\n-Y " +
        height +
        " +X " +
        width +
        "\n"
    ),
    data,
  ])
);
console.log("Prepared 256×128 studio illumination:", data.length, "bytes.");
