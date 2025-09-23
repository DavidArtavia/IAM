import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tsconfigPaths from "vite-tsconfig-paths"
import path from "node:path"
import { visualizer } from "rollup-plugin-visualizer"

const isAnalyze = process.env.ANALYZE === "true"

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    isAnalyze &&
    visualizer({
      filename: "./dist/stats.html", // genera el reporte aquí
      open: true,                     // abre el navegador automáticamente
      gzipSize: true,                 // muestra tamaño comprimido gzip
      brotliSize: true,               // muestra tamaño comprimido brotli
      template: "treemap",            // tipos: treemap | sunburst | list
      title: "Reporte del Bundle - TallerApp",
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@assets": path.resolve(__dirname, "src/assets")
    }
  },
  base: "/",
})
