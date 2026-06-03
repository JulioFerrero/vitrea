import type { PromptAnswers } from "../prompts.ts";

export function editorDenoJson(_answers: PromptAnswers): string {
  return JSON.stringify({
    tasks: {
      dev: "deno run -A --env-file=../../.env npm:vite",
      build: "deno run -A --env-file=../../.env npm:vite build",
      start: "deno run -A --env-file=../../.env server.ts",
    },
    imports: {
      "@/": "./",
      "preact": "npm:preact@^10.29.1",
      "preact/compat": "npm:preact@^10.29.1/compat",
      "preact/jsx-runtime": "npm:preact@^10.29.1/jsx-runtime",
      "react": "npm:preact@^10.29.1/compat",
      "react-dom": "npm:preact@^10.29.1/compat",
      "react/jsx-runtime": "npm:preact@^10.29.1/jsx-runtime",
      "zustand": "npm:zustand@^5.0.0",
      "@tailwindcss/vite": "npm:@tailwindcss/vite@^4.1.0",
      "tailwindcss": "npm:tailwindcss@^4.1.0",
      "vite": "npm:vite@^7.1.3",
      "@fontsource/fraunces": "npm:@fontsource/fraunces@^5.2.9",
      "@fontsource/recursive": "npm:@fontsource/recursive@^5.2.8",
      "@hi/editor": "jsr:@hi/editor@^0.1.1",
      "@hi/editor/api": "jsr:@hi/editor@^0.1.1/api",
      "@hi/editor/server": "jsr:@hi/editor@^0.1.1/server",
      "@site/website": "../../packages/website/src/index.ts",
    },
    compilerOptions: {
      lib: ["dom", "dom.asynciterable", "dom.iterable", "deno.ns"],
      jsx: "precompile",
      jsxImportSource: "preact",
      jsxPrecompileSkipElements: ["a","img","source","body","html","head","title","meta","script","link","style","base","noscript","template"],
      types: ["vite/client"],
    },
    exclude: ["dist"],
  }, null, 2);
}

export function editorViteConfig(): string {
  return `import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "../..");

export default defineConfig({
  esbuild: {
    jsxImportSource: "preact",
    jsx: "automatic",
  },
  plugins: [tailwindcss()],
  resolve: {
    alias: [
      { find: "react/jsx-runtime", replacement: "preact/jsx-runtime" },
      { find: "react-dom", replacement: "preact/compat" },
      { find: "react", replacement: "preact/compat" },
      { find: "lucide-react", replacement: resolve(root, "node_modules/lucide-preact/dist/esm/lucide-preact.js") },
      { find: "@fontsource/fraunces", replacement: resolve(root, "node_modules/@fontsource/fraunces") },
      { find: "@fontsource/recursive", replacement: resolve(root, "node_modules/@fontsource/recursive") },
    ],
    dedupe: ["react", "react-dom", "react/jsx-runtime", "preact"],
  },
});
`;
}

export function editorServerTs(): string {
  return `import { createServer } from "@hi/editor/server";
import { tailwindCssResponse, iframeBaseCSS, fontCSSWithAbsoluteURLs } from "@site/website";
import { join } from "node:path";
import { readFile, stat } from "node:fs/promises";

let cachedFontCSS = "";
let cachedFontDirs = new Map<string, string>();

(async () => {
  const result = await fontCSSWithAbsoluteURLs();
  cachedFontCSS = result.css;
  cachedFontDirs = result.fontDirs;
})();

const FONT_MIME: Record<string, string> = {
  ".woff2": "font/woff2", ".woff": "font/woff", ".ttf": "font/ttf", ".otf": "font/otf",
};

createServer({
  distDir: join(import.meta.dirname!, "dist"),
  tailwindCSS: (classes) => tailwindCssResponse(classes),
  iframeBaseCSS: async () => {
    const base = await iframeBaseCSS();
    return [base, cachedFontCSS].filter(Boolean).join("\\n");
  },
  fontFileHandler: async (urlPathname: string) => {
    const match = urlPathname.match(/^\\/fonts\\/([^/]+)\\/files\\/(.+)$/);
    if (!match) return null;
    const [, pkgBaseName, fileName] = match;
    const dir = cachedFontDirs.get(pkgBaseName!);
    if (!dir) return null;
    const filePath = join(dir, fileName!);
    try {
      await stat(filePath);
      const ext = fileName!.includes(".") ? fileName!.slice(fileName!.lastIndexOf(".")) : "";
      const ct = FONT_MIME[ext] ?? "application/octet-stream";
      const content = await readFile(filePath);
      return new Response(new Uint8Array(content), {
        headers: { "content-type": ct, "cache-control": "public, max-age=31536000, immutable" },
      });
    } catch { return null; }
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
    <title>${answers.projectName}</title>
  </head>
  <body class="overflow-hidden">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`;
}

export function editorMainTsx(): string {
  return `import { render } from "preact";
import { App } from "./app";
import "../assets/styles.css";

render(<App />, document.getElementById("root")!);
`;
}

export function editorAppTsx(_answers: PromptAnswers): string {
  return `import { EditorApp } from "@hi/editor";
import { schema, websiteRenderer } from "@site/website";

export function App() {
  return <EditorApp schema={schema} renderer={websiteRenderer} />;
}
`;
}

export function editorStylesCss(): string {
  return `@import "tailwindcss";
@import "@hi/editor/styles.css";
@import "@fontsource/fraunces/index.css";
@import "@fontsource/recursive/index.css";
`;
}
