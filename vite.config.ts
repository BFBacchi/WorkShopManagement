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
    include: [],
  },
  build: {
    // Minimizar el uso de eval() en producción
    minify: 'esbuild',
    rollupOptions: {
      output: {
        // Evitar el uso de eval() en el código generado
        format: 'es',
      },
    },
  },
  // 👇 Solo aplica en desarrollo
  server: {
    headers:
      mode === "development"
        ? {
            "Content-Security-Policy":
              "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: blob: https:; connect-src 'self' https: wss:; font-src 'self' data: https:; object-src 'none'; base-uri 'self';",
          }
        : {},
  },
}));
