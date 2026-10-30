import assert from "node:assert/strict";
import { chromium } from "playwright-core";
import { writeFileSync } from "node:fs";
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH || "/usr/bin/google-chrome",
  headless: true,
  args: ["--no-sandbox", "--enable-unsafe-swiftshader"],
});
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  });
  await page.route(/googletagmanager|google-analytics/, r => r.abort());
  await page.addInitScript(() => {
    window.__frames = 0;
    const original = requestAnimationFrame;
    window.requestAnimationFrame = callback =>
      original(time => {
        window.__frames++;
        callback(time);
      });
  });
  await page.goto("http://localhost:3000/");
  await page
    .getByRole("status")
    .filter({ hasText: "Drag or arrow keys" })
    .waitFor({ timeout: 10000 });
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await page.waitForTimeout(350);
  const rest = await page.locator("canvas").screenshot();
  await page.getByRole("button", { name: "Wave", exact: false }).click();
  await page.waitForTimeout(1200);
  const wave = await page.locator("canvas").screenshot();
  assert.notDeepEqual(
    rest,
    wave,
    "Wave must visibly articulate the original rig"
  );
  await page.screenshot({ path: "artifacts/fetch-wave-1440.png" });
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await page.waitForTimeout(1000);
  await page.mouse.move(25, 300);
  await page.waitForTimeout(700);
  const lookLeft = await page.locator("canvas").screenshot();
  await page.mouse.move(1400, 300);
  await page.waitForTimeout(700);
  const lookRight = await page.locator("canvas").screenshot();
  assert.notDeepEqual(
    lookLeft,
    lookRight,
    "The restored head must track pointer movement"
  );
  let last = await page.evaluate(() => window.__frames),
    quiet = 0;
  for (let i = 0; i < 40 && quiet < 3; i++) {
    await page.waitForTimeout(100);
    const next = await page.evaluate(() => window.__frames);
    quiet = next === last ? quiet + 1 : 0;
    last = next;
  }
  assert.ok(quiet >= 3, "Head tracking must settle");
  const start = await page.evaluate(() => window.__frames);
  await page.waitForTimeout(500);
  const idleFrames = (await page.evaluate(() => window.__frames)) - start;
  assert.equal(idleFrames, 0);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("http://localhost:3000/");
  let homeVideoRequests = 0;
  const trackHomeVideo = r => {
    if (r.url().endsWith("/showcase.mp4")) homeVideoRequests++;
  };
  page.on("request", trackHomeVideo);
  assert.equal(await page.locator("video").count(), 0);
  assert.equal(homeVideoRequests, 0);
  await page
    .getByRole("button", { name: "Play video: Same Scene, Different Story" })
    .click();
  await page.waitForFunction(() => {
    const video = document.querySelector("video");
    return video && video.currentTime > 0 && !video.paused;
  });
  assert.ok(homeVideoRequests > 0);
  page.off("request", trackHomeVideo);
  await page.goto("http://localhost:3000/research/rpx/");
  let videoRequests = 0;
  page.on("request", r => {
    if (r.url().endsWith("/showcase.mp4")) videoRequests++;
  });
  assert.equal(await page.locator("video").count(), 0);
  await page.getByRole("button", { name: "Play RPX showcase" }).click();
  await page.waitForFunction(() => {
    const video = document.querySelector("video");
    return video && video.currentTime > 0 && !video.paused;
  });
  const playback = await page.locator("video").evaluate(video => ({
    muted: video.muted,
    width: video.videoWidth,
    height: video.videoHeight,
    currentTime: video.currentTime,
  }));
  assert.equal(playback.muted, true);
  assert.equal(playback.width, 960);
  assert.ok(videoRequests > 0);
  const result = {
    waveArticulates: true,
    headTracksPointer: true,
    idleFrames,
    videoLoadsOnlyOnClick: true,
    homepageVideoLoadsOnlyOnClick: true,
    playback,
  };
  writeFileSync(
    "artifacts/interaction-report.json",
    JSON.stringify(result, null, 2)
  );
  console.log(result);
} finally {
  await browser.close();
}
