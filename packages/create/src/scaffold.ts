import { dirname, join } from "node:path";
import { mkdir, writeFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { PromptAnswers } from "./prompts";
import {
  rootPackageJson, pnpmWorkspaceYaml, rootTsconfigBase, envFile, gitignore,
  webPackageJson, webNextConfig, webTsconfig, webNextEnvDts, webPostcssConfig, webAppLayout, webGlobalsCss, webCatchAllRoute,
  editorPackageJson, editorTsconfig, editorViteConfig, editorIndexHtml, editorMainTsx, editorAppTsx, editorStylesCss,
  drizzleConfigTs, drizzleSchemaTs,
  internalWebPackageJson, internalEditorPackageJson, internalPkgTsconfig, internalWebIndex, internalWebRenderer, internalWebThemeCss, internalWebStylesCss, internalWebTailwind, internalWebComponentsIndex,
  internalEditorIndex, internalEditorElementsIndex, internalEditorContent, internalEditorStructure,
  internalEditorElementHero, internalEditorElementFeatures, internalEditorElementFooter,
  internalWebComponentSection, internalWebComponentRow, internalWebComponentColumn, internalWebComponentGrid, internalWebComponentHeading, internalWebComponentText, internalWebComponentImage, internalWebComponentButton, internalWebComponentLink, internalWebComponentSpacer, internalWebComponentDivider, internalWebComponentVideo, internalWebComponentHtml, internalWebComponentHero, internalWebComponentFeatures, internalWebComponentFooter,
  dockerComposeFull, dockerComposeLocal, seaweedfsConfig, vercelJson, flyToml, railwayJson,
} from "./templates/index";

const execFileAsync = promisify(execFile);

export function listFiles(answers: PromptAnswers): string[] {
  const f = [
    "package.json", "pnpm-workspace.yaml", "tsconfig.base.json", ".env", ".gitignore", "drizzle.config.ts",
    "drizzle/schema.ts",
    "apps/web/package.json", "apps/web/next.config.ts", "apps/web/tsconfig.json", "apps/web/next-env.d.ts",
    "apps/web/postcss.config.mjs", "apps/web/src/app/layout.tsx", "apps/web/src/app/globals.css", "apps/web/src/app/[[...slug]]/page.tsx",
    "apps/editor/package.json", "apps/editor/tsconfig.json", "apps/editor/vite.config.ts", "apps/editor/index.html",
    "apps/editor/src/main.tsx", "apps/editor/src/app.tsx", "apps/editor/assets/styles.css",
    "internal/web/package.json", "internal/web/tsconfig.json", "internal/web/src/index.ts",
    "internal/web/src/renderer.tsx", "internal/web/src/theme.css", "internal/web/src/styles.css", "internal/web/src/lib/tailwind.ts", "internal/web/src/components/index.ts",
    "internal/web/src/components/section.tsx", "internal/web/src/components/row.tsx", "internal/web/src/components/column.tsx",
    "internal/web/src/components/grid.tsx", "internal/web/src/components/heading.tsx", "internal/web/src/components/text.tsx",
    "internal/web/src/components/image.tsx", "internal/web/src/components/button.tsx", "internal/web/src/components/link.tsx",
    "internal/web/src/components/spacer.tsx", "internal/web/src/components/divider.tsx", "internal/web/src/components/video.tsx",
    "internal/web/src/components/html.tsx",
    "internal/editor/package.json", "internal/editor/tsconfig.json", "internal/editor/src/index.ts",
    "internal/editor/src/elements/index.ts", "internal/editor/src/elements/content.ts", "internal/editor/src/elements/structure.ts",
  ];
  if (answers.includeExamples) {
    f.push(
      "internal/editor/src/elements/hero-section.ts",
      "internal/editor/src/elements/features-section.ts",
      "internal/editor/src/elements/footer-section.ts",
      "internal/web/src/components/hero-section.tsx",
      "internal/web/src/components/features-section.tsx",
      "internal/web/src/components/footer-section.tsx",
    );
  }
  if (answers.environment === "vps") {
    f.push("docker-compose.yml");
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
    await mkdir(dirname(fp), { recursive: true });
    await writeFile(fp, content, "utf8");
  };

  await w("package.json", rootPackageJson(answers));
  await w("pnpm-workspace.yaml", pnpmWorkspaceYaml());
  await w("tsconfig.base.json", rootTsconfigBase());
  await w(".env", envFile(answers));
  await w(".gitignore", gitignore());
  await w("drizzle.config.ts", drizzleConfigTs());
  await w("drizzle/schema.ts", drizzleSchemaTs());

  await w("apps/web/package.json", webPackageJson());
  await w("apps/web/next.config.ts", webNextConfig());
  await w("apps/web/tsconfig.json", webTsconfig());
  await w("apps/web/next-env.d.ts", webNextEnvDts());
  await w("apps/web/postcss.config.mjs", webPostcssConfig());
  await w("apps/web/src/app/layout.tsx", webAppLayout(answers));
  await w("apps/web/src/app/globals.css", webGlobalsCss());
  await w("apps/web/src/app/[[...slug]]/page.tsx", webCatchAllRoute());

  await w("apps/editor/package.json", editorPackageJson());
  await w("apps/editor/tsconfig.json", editorTsconfig());
  await w("apps/editor/vite.config.ts", editorViteConfig());
  await w("apps/editor/index.html", editorIndexHtml(answers));
  await w("apps/editor/src/main.tsx", editorMainTsx());
  await w("apps/editor/src/app.tsx", editorAppTsx());
  await w("apps/editor/assets/styles.css", editorStylesCss());

  await w("internal/web/package.json", internalWebPackageJson());
  await w("internal/web/tsconfig.json", internalPkgTsconfig());
  await w("internal/web/src/index.ts", internalWebIndex());
  await w("internal/web/src/renderer.tsx", internalWebRenderer());
  await w("internal/web/src/theme.css", internalWebThemeCss());
  await w("internal/web/src/styles.css", internalWebStylesCss());
  await w("internal/web/src/lib/tailwind.ts", internalWebTailwind());
  await w("internal/web/src/components/index.ts", internalWebComponentsIndex(answers));
  await w("internal/web/src/components/section.tsx", internalWebComponentSection());
  await w("internal/web/src/components/row.tsx", internalWebComponentRow());
  await w("internal/web/src/components/column.tsx", internalWebComponentColumn());
  await w("internal/web/src/components/grid.tsx", internalWebComponentGrid());
  await w("internal/web/src/components/heading.tsx", internalWebComponentHeading());
  await w("internal/web/src/components/text.tsx", internalWebComponentText());
  await w("internal/web/src/components/image.tsx", internalWebComponentImage());
  await w("internal/web/src/components/button.tsx", internalWebComponentButton());
  await w("internal/web/src/components/link.tsx", internalWebComponentLink());
  await w("internal/web/src/components/spacer.tsx", internalWebComponentSpacer());
  await w("internal/web/src/components/divider.tsx", internalWebComponentDivider());
  await w("internal/web/src/components/video.tsx", internalWebComponentVideo());
  await w("internal/web/src/components/html.tsx", internalWebComponentHtml());
  await w("internal/editor/package.json", internalEditorPackageJson());
  await w("internal/editor/tsconfig.json", internalPkgTsconfig());
  await w("internal/editor/src/index.ts", internalEditorIndex());
  await w("internal/editor/src/elements/index.ts", internalEditorElementsIndex(answers));
  await w("internal/editor/src/elements/content.ts", internalEditorContent());
  await w("internal/editor/src/elements/structure.ts", internalEditorStructure());
  if (answers.includeExamples) {
    await w("internal/editor/src/elements/hero-section.ts", internalEditorElementHero(answers));
    await w("internal/editor/src/elements/features-section.ts", internalEditorElementFeatures());
    await w("internal/editor/src/elements/footer-section.ts", internalEditorElementFooter(answers));
    await w("internal/web/src/components/hero-section.tsx", internalWebComponentHero());
    await w("internal/web/src/components/features-section.tsx", internalWebComponentFeatures());
    await w("internal/web/src/components/footer-section.tsx", internalWebComponentFooter());
  }

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
    await execFileAsync("git", ["init"], { cwd: dir });
    await execFileAsync("git", ["add", "."], { cwd: dir });
  }
}
