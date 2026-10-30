import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "path";
import { defineConfig } from "vite";

const plugins = [react(), tailwindcss()];

function computeBase() {
  // 1) Honor explicit override
  if (process.env.VITE_BASE) return process.env.VITE_BASE;

  // 2) Derive from GitHub repo context (Actions)
  const repo = process.env.GITHUB_REPOSITORY; // e.g. owner/name
  if (repo) {
    const [owner, name] = repo.split("/");
    if (owner && name) {
      const isUserSite =
        name.toLowerCase() === `${owner.toLowerCase()}.github.io`;
      return isUserSite ? "/" : `/${name}/`;
    }
  }

  // 3) Default for local dev
  return "/";
}

export default defineConfig({
  plugins,
  base: computeBase(),
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    strictPort: false, // Will find next available port if 3000 is busy
    host: true,
    allowedHosts: [
      ".manuspre.computer",
      ".manus.computer",
      ".manus-asia.computer",
      ".manuscomputer.ai",
      ".manusvm.computer",
      "localhost",
      "127.0.0.1",
    ],
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
