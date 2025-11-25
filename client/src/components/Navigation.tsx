import { Link, useLocation } from "wouter";

export default function Navigation() {
  const [location] = useLocation();

  const isActive = (path: string) => location === path;

  return (
    <nav className="border-b border-border sticky top-0 bg-background z-50">
      <div className="container">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="no-underline">
            <h2 className="text-xl font-bold text-foreground hover:text-muted-foreground transition-colors">
              Itay Kadosh
            </h2>
          </Link>

          <div className="flex items-center gap-8">
            <Link
              href="/"
              className={`nav-link ${isActive("/") ? "active" : ""}`}
            >
              Home
            </Link>
            <Link
              href="/about"
              className={`nav-link ${isActive("/about") ? "active" : ""}`}
            >
              About
            </Link>
            <Link
              href="/experience"
              className={`nav-link ${isActive("/experience") ? "active" : ""}`}
            >
              Experience
            </Link>
            <Link
              href="/publications"
              className={`nav-link ${isActive("/publications") ? "active" : ""}`}
            >
              Publications
            </Link>
            <Link
              href="/cv"
              className={`nav-link ${isActive("/cv") ? "active" : ""}`}
            >
              CV
            </Link>
            <Link
              href="/model"
              className={`nav-link ${isActive("/model") ? "active" : ""}`}
            >
              3D Model
            </Link>
            <Link
              href="/fetch"
              className={`nav-link ${isActive("/fetch") ? "active" : ""}`}
            >
              Fetch Demo
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
