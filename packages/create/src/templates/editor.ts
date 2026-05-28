import type { PromptAnswers } from "../prompts.ts";

export function editorDenoJson(_answers: PromptAnswers): string {
  return JSON.stringify({
    tasks: {
      dev: "deno run -A --env=../../.env npm:vite",
      build: "deno run -A --env=../../.env npm:vite build",
      start: "deno run -A --env=../../.env server.ts",
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
      "@hi/editor": "../../packages/editor/src/index.ts",
      "@hi/editor/api": "../../packages/editor/src/api/index.ts",
      "@hi/editor/server": "../../packages/editor/src/server.ts",
      "@hi/render": "../../packages/render/src/index.ts",
      "@hi/ui": "../../packages/ui/src/index.ts",
      "@hi/database": "../../packages/database/src/index.ts",
      "@hi/utils": "../../packages/utils/src/index.ts",
      "@hi/website": "../../packages/website/src/index.ts",
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
import { denoWorkspacePlugin } from "./vite-plugin-deno";

const root = resolve(import.meta.dirname, "../..");

export default defineConfig({
  esbuild: {
    jsxImportSource: "preact",
    jsx: "automatic",
  },
  plugins: [
    denoWorkspacePlugin(root, "@hi"),
    tailwindcss(),
  ],
  resolve: {
    alias: [
      { find: "react/jsx-runtime", replacement: "preact/jsx-runtime" },
      { find: "react-dom", replacement: "preact/compat" },
      { find: "react", replacement: "preact/compat" },
      { find: "lucide-react", replacement: resolve(root, "node_modules/lucide-preact/dist/esm/lucide-preact.js") },
      { find: "@fontsource/fraunces", replacement: resolve(root, "node_modules/@fontsource/fraunces") },
      { find: "@fontsource/recursive", replacement: resolve(root, "node_modules/@fontsource/recursive") },
      { find: "@hi/editor/styles.css", replacement: resolve(root, "packages/editor/src/styles.css") },
      { find: "@hi/website/styles.css", replacement: resolve(root, "packages/website/src/styles.css") },
    ],
    dedupe: ["react", "react-dom", "react/jsx-runtime", "preact"],
  },
});
`;
}

export function editorVitePluginDeno(): string {
  return `import type { Plugin } from "vite";
import { resolve } from "node:path";
import { readFileSync, existsSync } from "node:fs";

const EXTENSIONS = [".tsx", ".ts", ".jsx", ".js", "/index.tsx", "/index.ts"];

const cache = new Map<string, Record<string, string>>();

function loadExports(pkgRoot: string): Record<string, string> {
  if (cache.has(pkgRoot)) return cache.get(pkgRoot)!;
  try {
    const json = JSON.parse(readFileSync(resolve(pkgRoot, "deno.json"), "utf-8"));
    const exports: Record<string, string> = {};
    for (const [key, val] of Object.entries(json.exports ?? {})) {
      if (typeof val === "string") {
        exports[key] = resolve(pkgRoot, val);
      } else if (typeof val === "object" && val !== null) {
        const target = (val as Record<string, string>).default || (val as Record<string, string>).sass;
        if (target) exports[key] = resolve(pkgRoot, target);
      }
    }
    cache.set(pkgRoot, exports);
    return exports;
  } catch {
    return {};
  }
}

export function denoWorkspacePlugin(workspaceRoot: string, scope: string): Plugin {
  return {
    name: "deno-workspace-resolve",
    enforce: "pre",
    resolveId(source, _importer) {
      if (!source.startsWith(scope + "/")) return null;
      const parts = source.slice(scope.length + 1).split("/");
      const pkgName = parts[0];
      const subpath = parts.length > 1 ? "./" + parts.slice(1).join("/") : ".";
      const pkgRoot = resolve(workspaceRoot, "packages", pkgName);
      const exports = loadExports(pkgRoot);
      if (exports[subpath]) return exports[subpath];
      for (const ext of EXTENSIONS) {
        const candidate = resolve(pkgRoot, "src", parts.slice(1).join("/") + ext);
        if (existsSync(candidate)) return candidate;
      }
      return null;
    },
  };
}
`;
}

export function editorServerTs(): string {
  return `import { createServer } from "@hi/editor/server";
import { tailwindCssResponse, iframeBaseCSS, fontCSSWithAbsoluteURLs } from "@hi/website";
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
  return `import { useState, useEffect } from "react";
import { createApiFetch, Dashboard, Editor, CmsView, AuthGate, UsersPage, AccountPage, AssetsPage, SiteSettingsPage } from "@hi/editor";
import { schema, websiteRenderer } from "@hi/website";

const api = createApiFetch();

type View = "dashboard" | "editor" | "content" | "users" | "account" | "assets" | "settings";

function parsePath(): { view: View; siteId: string | null } {
  const seg = location.pathname.split("/").filter(Boolean);
  if (seg[0] === "admin" && seg[1] === "users") return { view: "users", siteId: null };
  if (seg[0] === "account") return { view: "account", siteId: null };
  if (seg.length >= 2 && seg[1] === "assets") return { view: "assets", siteId: seg[0] };
  if (seg.length >= 2 && seg[1] === "content") return { view: "content", siteId: seg[0] };
  if (seg.length >= 2 && seg[1] === "settings") return { view: "settings", siteId: seg[0] };
  return { view: seg[0] ? "editor" : "dashboard", siteId: seg[0] || null };
}

export function App() {
  const [{ view, siteId }, setRoute] = useState(parsePath);

  useEffect(() => {
    const onPop = () => setRoute(parsePath());
    addEventListener("popstate", onPop);
    return () => removeEventListener("popstate", onPop);
  }, []);

  const nav = (path: string) => { history.pushState({}, "", path); setRoute(parsePath()); };

  return (
    <AuthGate api={api}>
      {view === "content" && siteId ? (
        <CmsView siteId={siteId} onBack={() => nav(\`/\${siteId}\`)} />
      ) : view === "users" ? (
        <UsersPage onBack={() => nav("/")} />
      ) : view === "account" ? (
        <AccountPage onBack={() => nav("/")} />
      ) : view === "assets" && siteId ? (
        <AssetsPage siteId={siteId} onBack={() => nav(\`/\${siteId}\`)} />
      ) : view === "settings" && siteId ? (
        <SiteSettingsPage siteId={siteId} onBack={() => nav(\`/\${siteId}\`)} />
      ) : view === "editor" && siteId ? (
        <Editor siteId={siteId} schema={schema} api={api} renderer={websiteRenderer} />
      ) : (
        <Dashboard api={api} onSelectSite={(id: string) => nav(\`/\${id}\`)} />
      )}
    </AuthGate>
  );
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
