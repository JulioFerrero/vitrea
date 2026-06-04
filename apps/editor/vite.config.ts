import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { config as loadDotenv } from "dotenv";
import { createEditorVitePlugin } from "@vitrea/editor/vite";

const currentDir = dirname(fileURLToPath(import.meta.url));
loadDotenv({ path: resolve(currentDir, "../../.env") });

export default defineConfig({
  plugins: [
    react(),
    createEditorVitePlugin({
      themePath: resolve(currentDir, "../../internal/web/src/theme.css"),
      stylesPath: resolve(currentDir, "../../internal/web/src/styles.css"),
    }),
    tailwindcss(),
  ],
  resolve: {
    dedupe: ["react", "react-dom"],
  },
});
