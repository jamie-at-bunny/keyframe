import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const root = path.dirname(fileURLToPath(import.meta.url));

// The studio (index.html) and the render target (render.html) share one dev
// server. Brand assets come from public/. The @keyframe packages are workspace
// links, so Vite compiles their TypeScript source directly.
export default defineConfig({
  root,
  publicDir: path.join(root, "public"),
  plugins: [react()],
  server: { port: 5199 },
});
