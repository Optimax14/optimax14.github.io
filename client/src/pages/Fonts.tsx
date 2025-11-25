import { useCallback, useEffect, useState } from "react";

type FontOption = {
  id: string; // css utility class suffix and variable name
  name: string;
  className: string; // e.g., "font-inter"
  varName: string; // e.g., "--font-inter"
  blurb: string;
};

const FONTS: FontOption[] = [
  { id: "system", name: "System UI (SF on Apple)", className: "font-system", varName: "--font-system", blurb: "Native platform sans-serif: SF Pro on macOS/iOS, Segoe UI on Windows, Roboto on Android." },
  { id: "inter", name: "Inter", className: "font-inter", varName: "--font-inter", blurb: "Neutral, legible UI font. Great for body and product UIs." },
  { id: "jakarta", name: "Plus Jakarta Sans", className: "font-jakarta", varName: "--font-jakarta", blurb: "Modern, friendly sans with a bit more personality for headings." },
  { id: "sora", name: "Sora", className: "font-sora", varName: "--font-sora", blurb: "Sharp, technical feel – nice for tech branding and headings." },
  { id: "space", name: "Space Grotesk", className: "font-space", varName: "--font-space", blurb: "Geometric grotesk with distinctive look; great for hero text." },
  { id: "lemon", name: "LEMON MILK (Display)", className: "font-lemon", varName: "--font-lemon", blurb: "Bold display font – use sparingly for large headings." },
];

export default function Fonts() {
  const [active, setActive] = useState<string>("system");

  // Apply preview globally by toggling a font utility on <body>
  const applyGlobal = useCallback((fontId: string) => {
    const body = document.body;
    // Remove any previously applied font classes
    FONTS.forEach((f) => body.classList.remove(f.className));
    const next = FONTS.find((f) => f.id === fontId);
    if (next) {
      body.classList.add(next.className);
      setActive(fontId);
    }
  }, []);

  useEffect(() => {
    // Ensure we start from clean state: rely on CSS default (system)
    const body = document.body;
    FONTS.forEach((f) => body.classList.remove(f.className));
    // Do not add any class initially; body CSS already uses system font.
  }, []);

  return (
    <section className="section-padding">
      <div className="container max-w-6xl">
        <h1 className="text-4xl font-bold mb-6">Font Playground</h1>
        <p className="text-muted-foreground mb-8">
          Compare a few clean, professional fonts for your portfolio. Click "Preview site" on any card to apply it globally while you browse.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {FONTS.map((font) => (
            <div key={font.id} className="p-6 border border-border rounded-lg bg-card">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <h2 className={`text-2xl font-semibold ${font.className}`}>{font.name}</h2>
                  <p className="text-sm text-muted-foreground mt-1">{font.blurb}</p>
                </div>
                <button
                  className={`px-3 py-1 rounded text-sm font-medium whitespace-nowrap border transition-colors ${
                    active === font.id
                      ? "bg-foreground text-background border-foreground"
                      : "bg-background text-foreground border-border hover:bg-card"
                  }`}
                  onClick={() => applyGlobal(font.id)}
                >
                  {active === font.id ? "Active" : "Preview site"}
                </button>
              </div>

              <div className={`p-4 rounded-md border border-border bg-background ${font.className}`}>
                <div className="space-y-2">
                  <div className="text-3xl font-bold">Itay Kadosh — Robotics</div>
                  <div className="text-lg text-muted-foreground">Robotics Researcher & Graduate School Applicant</div>
                  <p className="text-base leading-relaxed">
                    Passionate about autonomous systems, manipulation, and human-robot interaction. Exploring research that bridges theory and real-world impact.
                  </p>
                  <div className="flex gap-3 pt-2">
                    <button className="px-3 py-1.5 rounded bg-foreground text-background text-sm">Primary</button>
                    <button className="px-3 py-1.5 rounded border border-border text-sm">Secondary</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <button
            className="px-3 py-1.5 rounded border border-border hover:bg-card text-sm"
            onClick={() => applyGlobal("system")}
          >
            Reset to System (SF on Apple)
          </button>
        </div>
      </div>
    </section>
  );
}

