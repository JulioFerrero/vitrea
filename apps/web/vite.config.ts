import { defineConfig } from "vite";
import { fresh } from "@fresh/plugin-vite";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "../..");

export default defineConfig({
  plugins: [fresh(), tailwindcss()],
  resolve: {
    alias: {
      "react": "preact/compat",
      "react-dom": "preact/compat",
      "react/jsx-runtime": "preact/jsx-runtime",
      "lucide-react": resolve(root, "node_modules/lucide-preact/dist/esm/lucide-preact.js"),
      "@fontsource/fraunces": resolve(root, "node_modules/@fontsource/fraunces"),
      "@fontsource/recursive": resolve(root, "node_modules/@fontsource/recursive"),
      "@hi/render": resolve(import.meta.dirname, "../../packages/render/src"),
      "@hi/website": resolve(import.meta.dirname, "../../packages/website/src"),
      "@hi/database": resolve(import.meta.dirname, "../../packages/database/src/index.ts"),
      "@hi/utils": resolve(import.meta.dirname, "../../packages/utils/src/index.ts"),
    },
  },
});
