import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Read VITE_* variables from the single .env file in the project root
  envDir: path.resolve(__dirname, ".."),
  server: {
    port: 5173,
    open: false,
  },
  build: {
    chunkSizeWarningLimit: 1200,
  },
});
