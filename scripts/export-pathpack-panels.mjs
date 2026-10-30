import { chromium } from "playwright-core";
import { writeFileSync } from "node:fs";
const b = await chromium.launch({
  executablePath: "/usr/bin/google-chrome",
  headless: true,
  args: ["--no-sandbox"],
});
try {
  const p = await b.newPage({
    viewport: { width: 1440, height: 1800 },
    deviceScaleFactor: 1,
    reducedMotion: "reduce",
  });
  await p.goto(
    "https://algebraicjulia.github.io/PATHPACK.jl/dev/how-it-works",
    { waitUntil: "networkidle" }
  );
  await p.getByRole("tab", { name: /Reorder/ }).click();
  await p.waitForTimeout(700);
  const data = await p.locator(".pp-hiw-canvas").evaluateAll(es =>
    es.map(e => ({
      width: e.width,
      height: e.height,
      rect: {
        w: e.getBoundingClientRect().width,
        h: e.getBoundingClientRect().height,
      },
      png: e.toDataURL(),
    }))
  );
  for (let i = 0; i < data.length; i++) {
    writeFileSync(
      "/tmp/pathpack-panel-" + i + ".png",
      Buffer.from(data[i].png.split(",")[1], "base64")
    );
    delete data[i].png;
  }
  console.log(data);
} finally {
  await b.close();
}
