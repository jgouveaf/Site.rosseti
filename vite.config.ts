import { defineConfig } from "vite";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig(({ command }) => ({
  base: command === "build" ? "/Site.rosseti/" : "/",
  build: {
    rollupOptions: {
      input: {
        experience: resolve(root, "index.html"),
        neymar: resolve(root, "neymar/index.html"),
        exploration: resolve(root, "exploracao/index.html"),
      },
    },
  },
}));
