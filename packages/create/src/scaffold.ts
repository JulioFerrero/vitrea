import { join } from "@std/path";
import { ensureDir } from "@std/fs";
import type { PromptAnswers } from "./prompts.ts";
import {
  rootDenoJson, envFile, gitignore,
  webDenoJson, webMainTs, webViteConfig, webUtils, webAppLayout, webIndexRoute, webCatchAllRoute,
  editorDenoJson, editorViteConfig, editorServerTs, editorIndexHtml, editorMainTsx, editorAppTsx, editorStylesCss,
  drizzleConfigTs, drizzleSchemaTs, setupScriptTs, seedScriptTs,
  websitePkgDenoJson, websitePkgIndex, websitePkgElementsIndex, websitePkgContent, websitePkgStructure, websitePkgComponentsIndex,
  websiteElementHero, websiteElementFeatures, websiteElementFooter,
  websiteComponentHero, websiteComponentFeatures, websiteComponentFooter,
  dockerComposeFull, dockerComposeLocal, seaweedfsConfig, vercelJson, flyToml, railwayJson,
} from "./templates/index.ts";

export function listFiles(answers: PromptAnswers): string[] {
  const f = [
    "deno.json", ".env", ".gitignore", "drizzle.config.ts",
    "drizzle/schema.ts", "scripts/setup.ts", "scripts/seed.ts",
    "apps/web/deno.json", "apps/web/main.ts", "apps/web/vite.config.ts", "apps/web/utils.ts",
    "apps/web/routes/_app.tsx", "apps/web/routes/index.tsx", "apps/web/routes/[[slug]].tsx",
    "apps/editor/deno.json", "apps/editor/server.ts", "apps/editor/vite.config.ts",
    "apps/editor/index.html", "apps/editor/src/main.tsx", "apps/editor/src/app.tsx",
    "apps/editor/assets/styles.css",
    "packages/website/deno.json", "packages/website/src/index.ts",
    "packages/website/src/elements/index.ts",
    "packages/website/src/elements/content.ts",
    "packages/website/src/elements/structure.ts",
    "packages/website/src/components/index.ts",
  ];
  if (answers.includeExamples) {
    f.push(
      "packages/website/src/elements/hero-section.ts",
      "packages/website/src/elements/features-section.ts",
      "packages/website/src/elements/footer-section.ts",
      "packages/website/src/components/hero-section.tsx",
      "packages/website/src/components/features-section.tsx",
      "packages/website/src/components/footer-section.tsx",
    );
  }
  if (answers.environment === "vps") {
    f.push("docker-compose.yml", "Dockerfile", "Dockerfile.web");
    if (answers.storage === "seaweedfs") f.push("seaweedfs/s3.json");
  } else if (answers.environment === "local") {
    f.push("docker-compose.yml", "seaweedfs/s3.json");
  } else if (answers.cloudProvider === "vercel") f.push("vercel.json");
  else if (answers.cloudProvider === "fly") f.push("fly.toml");
  else if (answers.cloudProvider === "railway") f.push("railway.json");
  return f;
}

export async function scaffold(dir: string, answers: PromptAnswers): Promise<void> {
  const w = async (path: string, content: string) => {
    const fp = join(dir, path);
    await ensureDir(fp.substring(0, fp.lastIndexOf("/")));
    await Deno.writeTextFile(fp, content);
  };

  await w("deno.json", rootDenoJson(answers));
  await w(".env", envFile(answers));
  await w(".gitignore", gitignore());
  await w("drizzle.config.ts", drizzleConfigTs());
  await w("drizzle/schema.ts", drizzleSchemaTs());
  await w("scripts/setup.ts", setupScriptTs(answers));
  await w("scripts/seed.ts", seedScriptTs(answers));

  // apps/web
  await w("apps/web/deno.json", webDenoJson(answers));
  await w("apps/web/main.ts", webMainTs());
  await w("apps/web/vite.config.ts", webViteConfig());
  await w("apps/web/utils.ts", webUtils());
  await w("apps/web/routes/_app.tsx", webAppLayout(answers));
  await w("apps/web/routes/index.tsx", webIndexRoute(answers));
  await w("apps/web/routes/[[slug]].tsx", webCatchAllRoute());

  // apps/editor
  await w("apps/editor/deno.json", editorDenoJson(answers));
  await w("apps/editor/server.ts", editorServerTs());
  await w("apps/editor/vite.config.ts", editorViteConfig());
  await w("apps/editor/index.html", editorIndexHtml(answers));
  await w("apps/editor/src/main.tsx", editorMainTsx());
  await w("apps/editor/src/app.tsx", editorAppTsx(answers));
  await w("apps/editor/assets/styles.css", editorStylesCss());

  // packages/website — user's custom elements & components on top of the published @hi packages
  await w("packages/website/deno.json", websitePkgDenoJson());
  await w("packages/website/src/index.ts", websitePkgIndex(answers));
  await w("packages/website/src/elements/index.ts", websitePkgElementsIndex(answers));
  await w("packages/website/src/elements/content.ts", websitePkgContent());
  await w("packages/website/src/elements/structure.ts", websitePkgStructure());
  await w("packages/website/src/components/index.ts", websitePkgComponentsIndex(answers));
  if (answers.includeExamples) {
    await w("packages/website/src/elements/hero-section.ts", websiteElementHero(answers));
    await w("packages/website/src/elements/features-section.ts", websiteElementFeatures());
    await w("packages/website/src/elements/footer-section.ts", websiteElementFooter(answers));
    await w("packages/website/src/components/hero-section.tsx", websiteComponentHero());
    await w("packages/website/src/components/features-section.tsx", websiteComponentFeatures());
    await w("packages/website/src/components/footer-section.tsx", websiteComponentFooter());
  }

  // deploy
  if (answers.environment === "vps") {
    await w("docker-compose.yml", dockerComposeFull(answers));
    if (answers.storage === "seaweedfs") await w("seaweedfs/s3.json", seaweedfsConfig());
  } else if (answers.environment === "local") {
    await w("docker-compose.yml", dockerComposeLocal(answers));
    await w("seaweedfs/s3.json", seaweedfsConfig());
  } else if (answers.cloudProvider === "vercel") {
    await w("vercel.json", vercelJson());
  } else if (answers.cloudProvider === "fly") {
    await w("fly.toml", flyToml());
  } else if (answers.cloudProvider === "railway") {
    await w("railway.json", railwayJson());
  }

  if (answers.initGit) {
    await new Deno.Command("git", { args: ["init", dir] }).output();
    await new Deno.Command("git", { args: ["-C", dir, "add", "."] }).output();
  }
}
