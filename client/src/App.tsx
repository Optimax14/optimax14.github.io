import { Route, Switch, useLocation, Link } from "wouter";
import { useEffect, useRef } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import Navigation from "./components/Navigation";
import Home from "./pages/Home";
import Research from "./pages/Research";
import RPX from "./pages/RPX";
import Software from "./pages/Software";
import Publications from "./pages/Publications";
import About from "./pages/About";
import CV from "./pages/CV";
import { ResourceLinks } from "./components/ResearchContent";
import { profile, research } from "./data/research";
import { origin, pageMetadata } from "./data/pages";
import { logVisit } from "./utils/visitLogger";
function LegacyUpdate() {
  const [path] = useLocation();
  const r = research.find(record => record.slug === "autox-semmap")!;
  return (
    <div className="page-width">
      <header className="page-header">
        <p className="eyebrow">Research updates</p>
        <h1>
          {path === "/updates/autox-semmap" ? r.shortTitle : "Research, today"}
        </h1>
        <p>
          {path === "/updates/autox-semmap"
            ? r.summary
            : "This older update has been retired. Explore my current research, publications, and background below."}
        </p>
      </header>
      {path === "/updates/autox-semmap" && (
        <>
          <p>
            {r.status} · {r.venue} · {r.year}
          </p>
          <ResourceLinks links={r.links} />
        </>
      )}
      <div className="resource-links">
        <Link href="/research">Current research →</Link>
        <Link href="/publications">Publications →</Link>
        <Link href="/about">About & experience →</Link>
      </div>
    </div>
  );
}
function MissingPage() {
  return (
    <div className="page-width page-header">
      <p className="eyebrow">404</p>
      <h1>Page not found</h1>
      <p>
        <Link href="/">Return to Itay Kadosh’s homepage →</Link>
      </p>
    </div>
  );
}
export default function App() {
  const [location] = useLocation();
  const previousPath = useRef<string | null>(null);
  const path = location.split("#")[0].replace(/\/$/, "") || "/";
  useEffect(() => {
    if (previousPath.current !== null && previousPath.current !== path)
      document.getElementById("main")?.focus({ preventScroll: true });
    previousPath.current = path;
    const meta = pageMetadata(path);
    document.title = meta.title;
    const tags = [
      ['meta[name="description"]', "content", meta.description],
      ['meta[property="og:title"]', "content", meta.title],
      ['meta[property="og:description"]', "content", meta.description],
      ['meta[name="twitter:title"]', "content", meta.title],
      ['meta[name="twitter:description"]', "content", meta.description],
      ['meta[property="og:url"]', "content", origin + path],
      ['link[rel="canonical"]', "href", origin + path],
    ];
    tags.forEach(([selector, attr, value]) =>
      document.querySelector(selector)?.setAttribute(attr, value)
    );
    const hash = decodeURIComponent(window.location.hash.slice(1));
    if (hash) document.getElementById(hash)?.scrollIntoView();
    else window.scrollTo({ top: 0, behavior: "instant" });
    logVisit(path);
    const gtag = (window as Window & { gtag?: (...args: unknown[]) => void })
      .gtag;
    gtag?.("event", "page_view", {
      page_path: path,
      page_title: meta.title,
      page_location: window.location.href,
    });
  }, [path]);
  return (
    <ErrorBoundary>
      <Navigation />
      <main id="main" tabIndex={-1}>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/research/rpx" component={RPX} />
          <Route path="/research" component={Research} />
          <Route path="/publications" component={Publications} />
          <Route path="/about" component={About} />
          <Route path="/experience" component={About} />
          <Route path="/software" component={Software} />
          <Route path="/cv" component={CV} />
          <Route path="/updates/:slug" component={LegacyUpdate} />
          <Route component={MissingPage} />
        </Switch>
      </main>
      <footer className="site-footer">
        <div className="page-width">
          <div className="footer-top">
            <div>
              <p className="eyebrow">Get in touch</p>
              <h2>Contact</h2>
              <a className="contact-email" href={"mailto:" + profile.email}>
                {profile.email}
              </a>
            </div>
            <ResourceLinks links={profile.links} />
          </div>
          <div className="footer-bottom">
            <span>© 2026 Itay Kadosh</span>
            <span>University of Florida · Gainesville</span>
            <Link href="/cv">Curriculum vitae →</Link>
          </div>
        </div>
      </footer>
    </ErrorBoundary>
  );
}
