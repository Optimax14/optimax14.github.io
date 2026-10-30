import { createRoot, hydrateRoot } from "react-dom/client";
import { StrictMode } from "react";
import App from "./App";
import "./index.css";
const root = document.getElementById("root")!;
const app = (
  <StrictMode>
    <App />
  </StrictMode>
);
if (root.hasChildNodes()) hydrateRoot(root, app);
else createRoot(root).render(app);
