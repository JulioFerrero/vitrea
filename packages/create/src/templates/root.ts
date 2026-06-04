import type { PromptAnswers } from "../prompts";

export function rootPackageJson(answers: PromptAnswers): string {
  return JSON.stringify({
    name: "vitrea-project",
    private: true,
    packageManager: "pnpm@9.15.0",
    engines: {
      node: ">=20.11.0",
    },
    scripts: {
      setup: `vitrea setup --site-name "${answers.projectName}"`,
      "dev:web": "pnpm --filter @app/web dev",
      "dev:editor": "pnpm --filter @app/editor dev",
      dev: "concurrently -n web,editor -c blue,magenta \"pnpm dev:web\" \"pnpm dev:editor\"",
      "build:web": "pnpm --filter @app/web build",
      "build:editor": "pnpm --filter @app/editor build",
      build: "pnpm build:web && pnpm build:editor",
      "db:push": "drizzle-kit push --config=./drizzle.config.ts",
      "db:seed": `vitrea seed --site-name "${answers.projectName}"`,
    },
    dependencies: {
      "@vitrea/database": "^0.1.1",
      "drizzle-orm": "^0.43.0",
      postgres: "^3.4.5",
    },
    devDependencies: {
      "@vitrea/create": "^0.4.0",
      "@types/node": "^22.10.2",
      concurrently: "^9.1.0",
      dotenv: "^16.4.7",
      "drizzle-kit": "^0.31.0",
      typescript: "^5.7.2",
    },
  }, null, 2) + "\n";
}

export function pnpmWorkspaceYaml(): string {
  return `packages:\n  - "apps/*"\n  - "internal/*"\n  - "packages/*"\n`;
}

export function rootTsconfigBase(): string {
  return JSON.stringify({
    compilerOptions: {
      target: "ES2022",
      lib: ["ES2022", "DOM", "DOM.Iterable"],
      module: "ESNext",
      moduleResolution: "Bundler",
      jsx: "react-jsx",
      strict: true,
      skipLibCheck: true,
      esModuleInterop: true,
      allowSyntheticDefaultImports: true,
      resolveJsonModule: true,
      noEmit: true,
      baseUrl: ".",
      paths: {
        "@internal/editor": ["internal/editor/src/index.ts"],
        "@internal/web": ["internal/web/src/index.ts"],
      },
    },
    exclude: ["node_modules", ".next", "dist"],
  }, null, 2) + "\n";
}
