import type { PromptAnswers } from "../prompts.ts";

export function webDenoJson(_answers: PromptAnswers): string {
  return JSON.stringify({
    tasks: {
      dev: "deno run -A --env-file=../../.env npm:vite",
      build: "vite build",
      start: "deno serve -A --env-file=../../.env _fresh/server.js",
    },
    imports: {
      "@/": "./",
      "fresh": "jsr:@fresh/core@^2.3.3",
      "fresh/dev": "jsr:@fresh/core@^2.3.3/dev",
      "@fresh/plugin-tailwind": "jsr:@fresh/plugin-tailwind@^1.0.0",
      "@fresh/plugin-vite": "jsr:@fresh/plugin-vite@^1.1.2",
      "preact": "npm:preact@^10.29.1",
      "react": "npm:preact@^10.29.1/compat",
      "react-dom": "npm:preact@^10.29.1/compat",
      "react/jsx-runtime": "npm:preact@^10.29.1/jsx-runtime",
      "@tailwindcss/vite": "npm:@tailwindcss/vite@^4.1.0",
      "tailwindcss": "npm:tailwindcss@^4.1.0",
      "vite": "npm:vite@^7.1.3",
      "@hi/database": "jsr:@hi/database@^0.1.0",
      "@site/website": "../../packages/website/src/index.ts",
    },
    compilerOptions: {
      lib: ["dom", "dom.asynciterable", "dom.iterable", "deno.ns"],
      jsx: "precompile",
      jsxImportSource: "preact",
      jsxPrecompileSkipElements: ["a","img","source","body","html","head","title","meta","script","link","style","base","noscript","template"],
      types: ["vite/client"],
    },
    exclude: ["**/_fresh/*"],
  }, null, 2);
}

export function webMainTs(): string {
  return `import { App, staticFiles } from "fresh";
export const app: App = new App();
app.use(staticFiles());
app.fsRoutes();
`;
}

export function webViteConfig(): string {
  return `import { defineConfig } from "vite";
import { fresh } from "@fresh/plugin-vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [fresh(), tailwindcss()],
  resolve: {
    alias: {
      "react": "preact/compat",
      "react-dom": "preact/compat",
      "react/jsx-runtime": "preact/jsx-runtime",
    },
  },
});
`;
}

export function webUtils(): string {
  return `import { createDefine } from "fresh";
export type State = Record<string, never>;
export const define = createDefine<State>();
`;
}

export function webAppLayout(answers: PromptAnswers): string {
  return `import { define } from "../utils.ts";
export default define.page(function App({ Component }) {
  return (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${answers.projectName}</title>
      </head>
      <body>
        <Component />
      </body>
    </html>
  );
});
`;
}

export function webIndexRoute(_answers: PromptAnswers): string {
  return `import { define } from "../utils.ts";
export default define.page(function Index() {
  return (
    <main>
      <section class="py-24 text-center">
        <h1 class="text-5xl font-bold">Welcome</h1>
        <p class="mt-4 text-lg text-gray-600">Built with Hi Editor</p>
      </section>
    </main>
  );
});
`;
}

export function webCatchAllRoute(): string {
  return `import { page } from "fresh";
import { define } from "../utils.ts";
import { PageRenderer, COMPONENT_REGISTRY, type RenderElement } from "@site/website";
import { db, pages } from "@hi/database";
import { eq } from "drizzle-orm";

type PageData = { error: string | null; content: RenderElement[] | null };

export const handler = define.handlers({
  async GET(ctx) {
    const siteId = Deno.env.get("WEBSITE_ID");
    if (!siteId) return page({ error: "WEBSITE_ID not configured", content: null });
    const slug = ctx.params.slug ?? "";
    const path = "/" + slug;
    const allPages = await db.select().from(pages).where(eq(pages.siteId, siteId));
    const found = allPages.find((p) => (p.data as Record<string, unknown>)?.path === path);
    if (!found) return page({ error: "Page not found: " + path, content: null });
    return page({ error: null, content: (found as { elements: RenderElement[] }).elements ?? [] });
  },
});

export default define.page<PageData>(function Page({ data }) {
  if (data.error) return <div class="p-16 text-center text-gray-500">{data.error}</div>;
  if (!data.content?.length) return <div class="p-16 text-center text-gray-500">No content yet</div>;
  return <PageRenderer content={data.content} renderer={COMPONENT_REGISTRY} />;
});
`;
}
