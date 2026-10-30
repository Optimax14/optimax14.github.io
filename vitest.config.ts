import { defineConfig } from "vitest/config";
import path from "node:path";
export default defineConfig({
  resolve: { alias: { "@": path.resolve("client/src") } },
  test: { include: ["tests/**/*.test.ts"] },
});
