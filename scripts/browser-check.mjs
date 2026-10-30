import assert from "node:assert/strict";
import { chromium } from "playwright-core";
import AxeBuilder from "@axe-core/playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { spawn } from "node:child_process";
const server = spawn(process.execPath, ["dist/index.js"], {
  env: { ...process.env, NODE_ENV: "production", PORT: "3100" },
});
await new Promise((resolve, reject) => {
  server.stdout.once("data", resolve);
  server.once("error", reject);
});
const dir = "artifacts";
mkdirSync(dir, { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH || "/usr/bin/google-chrome",
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const report = [];
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  reducedMotion: "reduce",
});
await context.route(/google-analytics|googletagmanager/, route =>
  route.abort()
);
const page = await context.newPage();
const errors = [];
page.on("pageerror", e => errors.push(e.message));
const requests = [];
page.on("request", r => requests.push(r.url()));
for (const width of [Number(process.argv[2] || 390)]) {
  await page.setViewportSize({ width, height: 1000 });
  for (const path of [
    "/",
    "/publications",
    "/cv",
    "/research",
    "/about",
    "/software",
    "/research/rpx",
  ]) {
    const response = await page.goto("http://localhost:3100" + path);
    await page.waitForSelector("main h1");
    await page.locator("img").evaluateAll(imgs =>
      Promise.all(
        imgs.map(img => {
          img.loading = "eager";
          return img.decode().catch(() => {});
        })
      )
    );
    await page.screenshot({
      path: dir + "/" + (path.slice(1) || "home") + "-" + width + ".png",
      fullPage: true,
    });
    const metrics = await page.evaluate(() => ({
      h1: document.querySelector("main h1")?.textContent,
      overflow: document.documentElement.scrollWidth > innerWidth,
      backgroundImage: getComputedStyle(document.body).backgroundImage,
      title: document.title,
      brokenImages: [...document.images]
        .filter(i => i.complete && !i.naturalWidth)
        .map(i => i.src),
    }));
    const axe = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    report.push({
      width,
      path,
      status: response.status(),
      ...metrics,
      violations: axe.violations.map(v => ({
        id: v.id,
        impact: v.impact,
        nodes: v.nodes.map(n => n.target),
      })),
    });
  }
}
await page.setViewportSize({ width: 390, height: 1000 });
await page.goto("http://localhost:3100/");
await page.getByRole("button", { name: "Menu", exact: false }).click();
await page.screenshot({ path: dir + "/mobile-nav-390.png" });
await page
  .getByRole("navigation", { name: "Primary navigation" })
  .getByRole("link", { name: "Publications", exact: true })
  .click();
report.push({
  mobileNav: await page.locator("main h1").innerText(),
  menuClosed: await page
    .getByRole("button", { name: "Menu", exact: false })
    .getAttribute("aria-expanded"),
});
const pdf = await context.request.get("http://localhost:3100/cv.pdf");
report.push({
  pdfStatus: pdf.status(),
  pdfType: pdf.headers()["content-type"],
  pdfHeader: (await pdf.body()).subarray(0, 5).toString(),
});
const initialHeavy = requests.filter(
  u => /\.(mp4|glb|urdf|stl|dae)(\?|$)/i.test(u) || /FetchHeroViewer/.test(u)
);
report.push({ initialHeavy, errors });
await page.goto("http://localhost:3100/research#rpx");
report.push({
  anchor: await page
    .locator("#rpx")
    .evaluate(e => e.getBoundingClientRect().top),
});
await page.reload();
report.push({ refresh: await page.locator("main h1").innerText() });
const noJS = await browser.newContext({
  javaScriptEnabled: false,
  viewport: { width: 390, height: 1000 },
});
const staticPage = await noJS.newPage();
await staticPage.goto("http://localhost:3100/");
await staticPage.screenshot({
  path: dir + "/home-no-javascript-390.png",
  fullPage: true,
});
report.push({ noJS: await staticPage.locator("main h1").innerText() });
await noJS.close();
writeFileSync(
  dir + "/browser-report-" + (process.argv[2] || 390) + ".json",
  JSON.stringify(report, null, 2)
);
console.log(JSON.stringify(report, null, 2));
await browser.close();
server.kill();
for (const item of report) {
  if ("status" in item) {
    assert.equal(item.status, 200);
    assert.equal(item.overflow, false);
    assert.equal(item.backgroundImage, "none");
    assert.deepEqual(item.brokenImages, []);
    assert.deepEqual(item.violations, []);
  }
  if ("initialHeavy" in item) {
    assert.deepEqual(item.initialHeavy, []);
    assert.deepEqual(item.errors, []);
  }
  if ("mobileNav" in item) {
    assert.equal(item.mobileNav, "Publications");
    assert.equal(item.menuClosed, "false");
  }
}
