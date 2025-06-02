import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    minify: "terser",
    target: "es2015",
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
    },
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "map-vendor": ["mapbox-gl", "react-map-gl"],
          "socket-vendor": ["socket.io-client"],
        },
      },
    },
  },
  optimizeDeps: {
    include: ["react", "react-dom", "react-router-dom", "mapbox-gl", "react-map-gl", "socket.io-client"],
  },
  define: {
    global: "globalThis",
  },
  esbuild: {
    drop: ["console", "debugger"],
    target: "es2015",
  },
})
