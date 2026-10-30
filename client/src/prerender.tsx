import { renderToString } from "react-dom/server";
import { Router } from "wouter";
import App from "./App";
export { pages, legacyPaths, origin, pageMetadata } from "./data/pages";
export function render(path: string) {
  return renderToString(
    <Router ssrPath={path}>
      <App />
    </Router>
  );
}
