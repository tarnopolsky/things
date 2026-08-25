import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import path from "path";
export default defineConfig({
  // The site lives at tarnopolsky.github.io/things/, not at a domain root, so every
  // built asset URL needs the prefix. Keep this in sync with `basename` in
  // react-router.config.js — and note that photo paths come from data, not imports,
  // so they are prefixed separately in app/data/chapters.js.
  base: "/things/",
  plugins: [reactRouter(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./app") // or "./src"
    }
  }
});
