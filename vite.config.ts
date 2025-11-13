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
  // Configuración del servidor de desarrollo
  server: {
    // CSP para desarrollo - permite extensiones del navegador y eval() para Vite HMR
    headers: {
      "Content-Security-Policy": "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: chrome-extension: http://localhost:* http://127.0.0.1:*; script-src 'self' 'unsafe-inline' 'unsafe-eval' https: chrome-extension: http://localhost:* http://127.0.0.1:* ws://localhost:* ws://127.0.0.1:*; style-src 'self' 'unsafe-inline' https: chrome-extension:; img-src 'self' data: blob: https: chrome-extension:; connect-src 'self' https: wss: ws: http://localhost:* http://127.0.0.1:* chrome-extension:; font-src 'self' data: https: chrome-extension:; object-src 'none'; base-uri 'self';"
    },
  },
}));
