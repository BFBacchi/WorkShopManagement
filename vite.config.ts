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
  // NOTA: No aplicamos CSP en desarrollo porque Vite HMR requiere eval()
  // La CSP solo se aplica en producción a través de vercel.json
  server: {
    headers: {},
  },
}));
