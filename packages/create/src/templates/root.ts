import type { PromptAnswers } from "../prompts.ts";

export function rootDenoJson(answers: PromptAnswers): string {
  return JSON.stringify({
    workspace: ["apps/*", "packages/*"],
    tasks: {
      "dev:web": "cd apps/web && deno task dev",
      "dev:editor": "cd apps/editor && deno task dev",
      "dev": "deno task dev:editor & deno task dev:web",
      "build:web": "cd apps/web && deno task build",
      "build:editor": "cd apps/editor && deno task build",
      "build": "deno task build:web && deno task build:editor",
      "db:push": "deno run -A --env .env npm:drizzle-kit push",
      "db:seed": "deno run -A --env .env jsr:@hi/database/seed",
    },
    compilerOptions: {
      lib: ["ES2022", "DOM", "DOM.Iterable", "deno.ns"],
      jsx: "react-jsx",
      jsxImportSource: "preact",
    },
    lint: { rules: { exclude: ["no-sloppy-imports", "no-import-prefix", "no-unversioned-import", "no-slow-types", "no-explicit-any"] } },
    unstable: ["bare-node-builtins", "detect-cjs", "node-globals", "sloppy-imports"],
    nodeModulesDir: "auto",
  }, null, 2);
}
