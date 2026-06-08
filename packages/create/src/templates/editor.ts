import type { PromptAnswers } from "../prompts";

export function editorPackageJson(): string {
  return JSON.stringify({
    name: "@app/editor",
    version: "0.0.0",
    private: true,
    type: "module",
    scripts: {
      dev: "vite --port 3001",
      build: "vite build",
      start: "vite preview --port 3001",
    },
    dependencies: {
      "@vitrea/editor": "^1.0.1",
      "@internal/editor": "workspace:*",
      "@internal/web": "workspace:*",
      react: "^19.1.0",
      "react-dom": "^19.1.0",
    },
    devDependencies: {
      "@fontsource/fraunces": "^5.2.9",
      "@fontsource/recursive": "^5.2.8",
      "@tailwindcss/vite": "^4.1.11",
      "@types/node": "^22.10.2",
      "@types/react": "^19.1.0",
      "@types/react-dom": "^19.1.0",
      "@vitejs/plugin-react": "^4.4.1",
      tailwindcss: "^4.1.11",
      typescript: "^5.7.2",
      vite: "^7.1.3",
      ws: "^8.18.0",
    },
  }, null, 2) + "\n";
}

export function editorTsconfig(): string {
  return JSON.stringify({
    extends: "../../tsconfig.base.json",
    compilerOptions: {
      jsx: "react-jsx",
      types: ["vite/client"],
    },
    include: ["src/**/*.ts", "src/**/*.tsx", "vite.config.ts"],
    exclude: ["node_modules", "dist"],
  }, null, 2) + "\n";
}

export function editorViteConfig(): string {
  return `import { defineConfig } from "vite";
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
`;
}

export function editorIndexHtml(answers: PromptAnswers): string {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${answers.projectName} Editor</title>
  </head>
  <body class="overflow-hidden">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`;
}

export function editorMainTsx(): string {
  return `import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app";
import "../assets/styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
`;
}

export function editorAppTsx(): string {
  return `import { EditorApp } from "@vitrea/editor";
import { schema } from "@internal/editor";
import { websiteRenderer } from "@internal/web";

export function App() {
  return <EditorApp schema={schema} renderer={websiteRenderer} />;
}
`;
}

export function editorStylesCss(): string {
  return `@import "tailwindcss";
@import "@vitrea/editor/styles.css";
@import "@fontsource/fraunces/index.css";
@import "@fontsource/recursive/index.css";
`;
}
