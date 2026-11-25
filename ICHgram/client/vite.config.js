import path from "node:path";
import { fileURLToPath } from "node:url";
import "dotenv/config";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const clientRoot = path.dirname(fileURLToPath(import.meta.url));
const apiPort = process.env.PORT || 5000;

export default defineConfig({
  root: clientRoot,
  plugins: [react()],
  resolve: {
    alias: { "@": path.join(clientRoot, "app") },
  },
  server: {
    port: 8080,
    strictPort: true,
    proxy: {
      "/api": `http://localhost:${apiPort}`,
      "/socket.io": { target: `http://localhost:${apiPort}`, ws: true },
    },
  },
});
