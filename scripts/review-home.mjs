import { chromium } from "playwright-core";
const browser = await chromium.launch({
  executablePath: "/usr/bin/google-chrome",
  headless: true,
  args: ["--no-sandbox", "--enable-unsafe-swiftshader"],
});
try {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    deviceScaleFactor: 2,
  });
  await context.route(/googletagmanager|google-analytics/, r => r.abort());
  const page = await context.newPage();
  page.on("pageerror", e => console.log("PAGE ERROR", e.message));
  await page.goto("http://localhost:3000/");
  await page
    .getByRole("status")
    .filter({ hasText: "Drag or arrow keys" })
    .waitFor({ timeout: 10000 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await page.waitForTimeout(300);
  await page.locator("canvas").screenshot({
    path: "/tmp/fetch-restored-poster.png",
    omitBackground: true,
  });
  await page.locator("img").evaluateAll(images =>
    Promise.all(
      images.map(image => {
        image.loading = "eager";
        return image.decode().catch(() => {});
      })
    )
  );
  await page.screenshot({
    path: "artifacts/home-redesign-1440.png",
    fullPage: true,
    scale: "css",
  });
  await page.getByRole("button", { name: "Close 3D viewer" }).click();
  await page.setViewportSize({ width: 390, height: 1000 });
  await page.reload();
  await page.locator("img").evaluateAll(images =>
    Promise.all(
      images.map(image => {
        image.loading = "eager";
        return image.decode().catch(() => {});
      })
    )
  );
  await page.screenshot({
    path: "artifacts/home-redesign-390.png",
    fullPage: true,
    scale: "css",
  });
  console.log(await page.locator("h1").innerText());
} finally {
  await browser.close();
}
