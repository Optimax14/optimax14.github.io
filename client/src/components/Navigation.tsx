import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
export default function Navigation() {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [location]);
  const routes = [
    ["/", "Home"],
    ["/research", "Research"],
    ["/publications", "Publications"],
    ["/software", "Software"],
    ["/about", "About"],
    ["/cv", "CV"],
  ];
  return (
    <header className="site-header">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <div className="page-width nav-row">
        <Link href="/" className="wordmark" aria-label="Itay Kadosh home">
          Itay Kadosh
        </Link>
        <button
          className="menu-toggle"
          aria-expanded={open}
          aria-controls="primary-nav"
          onClick={() => setOpen(!open)}
        >
          {open ? "Close menu" : "Menu"}{" "}
          <span aria-hidden="true">{open ? "−" : "+"}</span>
        </button>
        <nav
          id="primary-nav"
          aria-label="Primary navigation"
          className={open ? "primary-nav open" : "primary-nav"}
          onKeyDown={e => {
            if (e.key === "Escape") {
              setOpen(false);
              document
                .querySelector<HTMLButtonElement>(".menu-toggle")
                ?.focus();
            }
          }}
        >
          {routes.map(([path, label]) => (
            <Link
              key={path}
              href={path}
              onClick={() => setOpen(false)}
              aria-current={
                location === path ||
                (path === "/research" && location.startsWith("/research/")) ||
                (path === "/about" && location === "/experience")
                  ? "page"
                  : undefined
              }
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
