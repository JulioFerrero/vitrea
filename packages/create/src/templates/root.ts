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
    imports: {
      "hono": "npm:hono@^4.7.0",
      "better-auth": "npm:better-auth@^1.6.0",
      "@better-auth/drizzle-adapter": "npm:@better-auth/drizzle-adapter@^1.6.0",
      "drizzle-orm": "npm:drizzle-orm@^0.43.0",
      "@base-ui/react": "npm:@base-ui/react@^1.0.0",
      "react-arborist": "npm:react-arborist@^3.6.0",
      "class-variance-authority": "npm:class-variance-authority@^0.7.0",
      "nanoid": "npm:nanoid@^5.1.0",
      "clsx": "npm:clsx@^2.1.0",
      "tailwind-merge": "npm:tailwind-merge@^3.2.0",
      "@dnd-kit/core": "npm:@dnd-kit/core@^6.3.0",
      "@dnd-kit/sortable": "npm:@dnd-kit/sortable@^9.0.0",
      "@dnd-kit/utilities": "npm:@dnd-kit/utilities@^3.2.0",
      "@aws-sdk/client-s3": "npm:@aws-sdk/client-s3@^3.750.0",
      "@aws-sdk/s3-request-presigner": "npm:@aws-sdk/s3-request-presigner@^3.750.0",
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
