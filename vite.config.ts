import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const root = path.dirname(fileURLToPath(import.meta.url));

// The studio (index.html) and the render target (render.html) share one dev
// server. Brand assets come from public/.
export default defineConfig({
  root,
  publicDir: path.join(root, "public"),
  plugins: [react()],
  resolve: { alias: { "@keyframe": root } },
  server: { port: 5199 },
});
