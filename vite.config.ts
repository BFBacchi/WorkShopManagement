import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    include: ["qrcode"],
  },
  // 👇 Solo aplica en desarrollo
  server: {
    headers:
      mode === "development"
        ? {
            "Content-Security-Policy":
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'; object-src 'none'; base-uri 'self';",
          }
        : {},
  },
}));
