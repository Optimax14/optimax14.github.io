import { chromium } from "playwright-core";
import { writeFileSync } from "node:fs";
const browser = await chromium.launch({
  executablePath: "/usr/bin/google-chrome",
  headless: true,
  args: ["--no-sandbox"],
});
try {
  const page = await browser.newPage();
  await page.goto("http://localhost:3000/");
  const result = await page.evaluate(async () => {
    const module = await import("/fetch-converter.mjs");
    return await module.exportFetch();
  });
  writeFileSync(
    "/tmp/fetch-original.glb",
    Buffer.from(result.base64, "base64")
  );
  delete result.base64;
  console.log(result);
} finally {
  await browser.close();
}
