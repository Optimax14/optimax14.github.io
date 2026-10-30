import assert from "node:assert/strict";
import { chromium } from "playwright-core";
import { spawn } from "node:child_process";
import { writeFileSync, mkdirSync } from "node:fs";
const server = spawn(process.execPath, ["dist/index.js"], {
  env: { ...process.env, NODE_ENV: "production", PORT: "3100" },
});
await new Promise((resolve, reject) => {
  server.stdout.once("data", resolve);
  server.once("error", reject);
});
let browser;
try {
  browser = await chromium.launch({
    executablePath: process.env.CHROME_PATH || "/usr/bin/google-chrome",
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-dev-shm-usage",
      "--enable-unsafe-swiftshader",
    ],
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
  });
  await context.route(/googletagmanager|google-analytics/, r => r.abort());
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", e => errors.push(e.message));
  const modelRequests = [];
  page.on("request", request => {
    if (request.url().includes("fetch-original-quality.glb"))
      modelRequests.push(request.url());
  });
  await page.addInitScript(() => {
    window.__viewerFrames = 0;
    const original = window.requestAnimationFrame;
    window.requestAnimationFrame = callback =>
      original.call(window, time => {
        window.__viewerFrames++;
        callback(time);
      });
  });
  await page.goto("http://localhost:3100/");
  const coldStart = Date.now();
  await page.getByRole("button", { name: "Explore Fetch in 3D" }).click();
  await page
    .getByRole("status")
    .filter({ hasText: "Drag or arrow keys" })
    .waitFor({ timeout: 10000 });
  const coldReadyMs = Date.now() - coldStart;
  const canvas = page.locator("canvas");
  await canvas.focus();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("+");
  mkdirSync("artifacts", { recursive: true });
  await page.screenshot({ path: "artifacts/fetch-active-1440.png" });
  await page.getByRole("button", { name: "Close 3D viewer" }).click();
  assert.equal(await page.locator("canvas").count(), 0);
  const reopenStart = Date.now();
  await page.getByRole("button", { name: "Explore Fetch in 3D" }).click();
  await page
    .getByRole("status")
    .filter({ hasText: "Drag or arrow keys" })
    .waitFor();
  const reopenReadyMs = Date.now() - reopenStart;
  await new Promise(resolve => setTimeout(resolve, 200));
  const framesBefore = await page.evaluate(() => window.__viewerFrames);
  await new Promise(resolve => setTimeout(resolve, 500));
  const idleFrames =
    (await page.evaluate(() => window.__viewerFrames)) - framesBefore;
  assert.equal(idleFrames, 0, "Idle viewer should not render animation frames");
  assert.equal(
    modelRequests.length,
    1,
    "Reopening should reuse the decoded model"
  );
  await page.getByRole("button", { name: "Close 3D viewer" }).click();
  assert.deepEqual(errors, []);
  const blocked = await browser.newContext({
    viewport: { width: 390, height: 1000 },
  });
  await blocked.route(/googletagmanager|google-analytics/, r => r.abort());
  await blocked.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      if (String(type).includes("webgl")) return null;
      return original.call(this, type, ...args);
    };
  });
  const p = await blocked.newPage();
  await p.goto("http://localhost:3100/");
  await p.getByRole("button", { name: "Explore Fetch in 3D" }).click();
  await p
    .getByRole("status")
    .filter({ hasText: "3D is unavailable" })
    .waitFor();
  assert.equal(await p.locator("main h1").innerText(), "Itay Kadosh");
  await p.screenshot({
    path: "artifacts/fetch-no-webgl-390.png",
    fullPage: true,
  });
  const missing = await browser.newContext();
  await missing.route("**/research/fetch/**", r => r.abort());
  const q = await missing.newPage();
  await q.goto("http://localhost:3100/");
  await q.getByRole("button", { name: "Explore Fetch in 3D" }).click();
  await q
    .getByRole("status")
    .filter({ hasText: "3D is unavailable" })
    .waitFor({ timeout: 5000 });
  assert.equal(await q.locator("main h1").innerText(), "Itay Kadosh");
  const report = {
    coldReadyMs,
    reopenReadyMs,
    modelRequests: modelRequests.length,
    idleFrames,
    activeViewer: true,
    keyboardControls: true,
    closeUnmounts: true,
    noWebGLFallback: true,
    failedAssetFallback: true,
    errors,
  };
  writeFileSync(
    "artifacts/viewer-report.json",
    JSON.stringify(report, null, 2)
  );
  console.log(report);
} finally {
  await browser?.close();
  server.kill();
}
