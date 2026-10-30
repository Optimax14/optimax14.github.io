import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { PublicationStatus, research } from "../client/src/data/research";
import { pages, legacyPaths, pageMetadata } from "../client/src/data/pages";
describe("Research content integrity", () => {
  it("has stable unique slugs, ordered authors, destinations, and real media", () => {
    expect(new Set(research.map(r => r.slug)).size).toBe(research.length);
    for (const record of research) {
      expect(record.authors.filter(a => a.name === "Itay Kadosh")).toHaveLength(
        1
      );
      expect(new Set(record.authors.map(a => a.name)).size).toBe(
        record.authors.length
      );
      expect(Object.values(PublicationStatus)).toContain(record.status);
      for (const link of record.links)
        expect(new URL(link.href).protocol).toBe("https:");
      if (record.media)
        expect(existsSync(resolve("client/public", record.media.src))).toBe(
          true
        );
    }
  });
  it("keeps acceptance distinct from submissions and omits unavailable papers", () => {
    const accepted = research.filter(
      r => r.status === PublicationStatus.Accepted
    );
    expect(accepted).toHaveLength(1);
    expect(accepted[0].venue).toContain("WORLDS Workshop");
    for (const slug of ["rpx", "intelx", "pathpack", "cellular-sheaves"]) {
      const r = research.find(r => r.slug === slug)!;
      expect(r.status).toBe(PublicationStatus.Submitted);
      expect(r.links.some(l => l.label === "Paper")).toBe(false);
    }
  });
  it("uses public RPX attribution, including all three equal contributions", () => {
    const r = research.find(r => r.slug === "rpx")!;
    expect(r.authors).toHaveLength(9);
    expect(r.authors.filter(a => a.equal).map(a => a.name)).toEqual([
      "Jishnu Jaykumar P",
      "Itay Kadosh",
      "Narendhiran Vijayakumar",
    ]);
  });
});
describe("GitHub Pages build output", () => {
  it("serves each route as useful HTML with unique metadata and intact local URLs", () => {
    for (const route of [...Object.keys(pages), ...legacyPaths]) {
      const meta = pageMetadata(route);
      const html = readFileSync(
        resolve("dist/public", "." + route, "index.html"),
        "utf8"
      );
      expect(html).toContain('<main id="main"');
      expect(html).toContain(meta.title.replace(/&/g, "&amp;"));
      expect(html).toContain("https://optimax14.github.io" + route);
      for (const match of html.matchAll(/(?:href|src|data)="(\/[^"#?]*)/g)) {
        const path = match[1];
        const local = resolve("dist/public", "." + path);
        expect(
          existsSync(local) || existsSync(resolve(local, "index.html")),
          path
        ).toBe(true);
      }
    }
  });
  it("preserves the PDF while visibly disclosing its age", () => {
    const pdf = readFileSync("dist/public/cv.pdf");
    expect(pdf.subarray(0, 5).toString()).toBe("%PDF-");
    const html = readFileSync("dist/public/cv/index.html", "utf8");
    expect(html).toContain("Updated CV pending");
    expect(html).toContain("December 2025");
  });
  it("includes a sitemap, crawler policy, fallback and social preview", () => {
    for (const file of [
      "sitemap.xml",
      "robots.txt",
      "404.html",
      "social-preview.png",
    ])
      expect(existsSync("dist/public/" + file)).toBe(true);
  });
});
