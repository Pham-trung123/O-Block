import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  css: {
    // 🔥 Ép Vite dùng đúng file config CJS (tránh lỗi ES import Tailwind)
    postcss: path.resolve("./postcss.config.cjs"),
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
      },
    },
    hmr: {
      overlay: false, // ⚙️ tắt overlay lỗi CSS/PostCSS để không chặn UI
    },
  },
});
