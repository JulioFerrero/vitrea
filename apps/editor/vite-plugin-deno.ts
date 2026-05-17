import type { Plugin } from "vite";
import { resolve, dirname } from "node:path";
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

      if (exports[subpath]) {
        return exports[subpath];
      }

      for (const ext of EXTENSIONS) {
        const candidate = resolve(pkgRoot, "src", parts.slice(1).join("/") + ext);
        if (existsSync(candidate)) return candidate;
      }

      return null;
    },
  };
}
