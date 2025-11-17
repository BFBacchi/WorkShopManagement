import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig(() => ({
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
    minify: 'esbuild' as const,
    rollupOptions: {
      output: {
        // Evitar el uso de eval() en el código generado
        format: 'es' as const,
      },
    },
  },
  // Configuración del servidor de desarrollo
  // CSP con 'unsafe-eval' para permitir Vite HMR (Hot Module Replacement)
  server: {
    headers: {
      'Content-Security-Policy': "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: https: http://localhost:* ws://localhost:* wss://localhost:* chrome-extension:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https: http://localhost:* data: blob: chrome-extension:; style-src 'self' 'unsafe-inline' https: data: chrome-extension:; img-src 'self' data: blob: https: chrome-extension:; connect-src 'self' https: http://localhost:* ws://localhost:* wss://localhost:* data: chrome-extension:; font-src 'self' data: https: chrome-extension:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'; worker-src 'self' blob:;"
    },
  },
}));
