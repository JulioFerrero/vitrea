import { cp, mkdtemp, mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, dirname, extname, join, relative, resolve } from "node:path";
import { normalizeName, readEnvFile, runCommand } from "./runtime";

const IMPORT_MANIFEST_FILE_NAMES = ["vitrea.components.json", "vitrea.import.json"];

export type ImportSourceInfo = {
  original: string;
  cloneUrl: string;
  repoName: string;
  branch?: string;
  subdir?: string;
  entryFile?: string;
  defaultPrefix: string;
};

export type ImportedComponentSummary = {
  type: string;
  label: string;
  wrapperPath: string;
  elementPath: string;
};

export type ImportManifestSummary = {
  path: string;
  name?: string;
  version?: string;
};

export type ImportComponentsResult = {
  imported: ImportedComponentSummary[];
  dependencyUpdates: string[];
  unresolvedDependencies: string[];
  targetDirectory: string;
  usedPrefix: string;
  manifest?: ImportManifestSummary;
};

type SourceDependencyMap = Record<string, string>;

type ImportComponentManifestItem = {
  source: string;
  componentExport: string;
  schema: string;
  schemaExport: string;
  type: string;
  label: string;
};

type ImportProjectManifest = {
  name?: string;
  version?: string;
  prefix?: string;
  componentDir?: string;
  schemaDir?: string;
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  components?: ImportComponentManifestItem[];
};

type LoadedImportManifest = {
  path: string;
  manifest: ImportProjectManifest;
};

type ResolvedComponentEntry = {
  filePath: string;
  componentExportName: string;
  schemaFilePath: string;
  schemaExportName: string;
  type: string;
  label: string;
};

type GeneratedComponent = {
  type: string;
  label: string;
  componentExportName: string;
  elementExportName: string;
  wrapperImportLine: string;
  wrapperRegistryLine: string;
  elementImportLine: string;
  elementRegistryLine: string;
  wrapperFilePath: string;
  elementFilePath: string;
  sourceFilePath: string;
  relativeSourceImport: string;
  relativeSchemaImport: string;
  expectedComponentExportName: string;
  expectedSchemaExportName: string;
};

function sortStrings(left: string, right: string): number {
  return left.localeCompare(right);
}

function toPosixPath(value: string): string {
  return value.replaceAll("\\", "/");
}

function stripExtension(filePath: string): string {
  const extension = extname(filePath);
  return extension ? filePath.slice(0, -extension.length) : filePath;
}

function toPascalCase(value: string): string {
  return value
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

function toCamelCase(value: string): string {
  const pascal = toPascalCase(value);
  return pascal ? pascal.charAt(0).toLowerCase() + pascal.slice(1) : "importedElement";
}

function humanizeSlug(value: string): string {
  return value
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function sanitizeRelativeSourcePath(value: string): string {
  return toPosixPath(value).replace(/^\.?\//, "").replace(/\/+/g, "/");
}

function isPathInsideDirectory(filePath: string, directoryPath: string): boolean {
  const relativePath = relative(directoryPath, filePath);
  return relativePath === "" || (!relativePath.startsWith("..") && !relativePath.includes("../"));
}

function looksLikeGitUrl(source: string): boolean {
  return /^git@[^:]+:.+/.test(source) || source.endsWith(".git");
}

export function inspectImportSource(source: string, branchOverride?: string): ImportSourceInfo {
  const trimmed = source.trim();

  if (!trimmed) {
    throw new Error("A GitHub or git URL is required.");
  }

  if (looksLikeGitUrl(trimmed)) {
    const repoName = normalizeName(basename(trimmed).replace(/\.git$/, ""));
    return {
      original: trimmed,
      cloneUrl: trimmed,
      repoName,
      branch: branchOverride,
      defaultPrefix: repoName,
    };
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(trimmed);
  } catch {
    throw new Error("The source must be a valid GitHub or git URL.");
  }

  if (parsedUrl.hostname !== "github.com") {
    const repoName = normalizeName(basename(parsedUrl.pathname).replace(/\.git$/, ""));
    return {
      original: trimmed,
      cloneUrl: trimmed,
      repoName,
      branch: branchOverride,
      defaultPrefix: repoName,
    };
  }

  const segments = parsedUrl.pathname.split("/").filter(Boolean);
  const owner = segments[0];
  const repo = segments[1]?.replace(/\.git$/, "");

  if (!owner || !repo) {
    throw new Error("The GitHub URL must include an owner and repository.");
  }

  const cloneUrl = `https://github.com/${owner}/${repo}.git`;
  const repoName = normalizeName(repo);
  let branch = branchOverride;
  let subdir: string | undefined;
  let entryFile: string | undefined;

  if ((segments[2] === "tree" || segments[2] === "blob") && segments[3]) {
    branch ??= segments[3];
    const repoPath = segments.slice(4).join("/");
    if (segments[2] === "blob") {
      entryFile = repoPath;
      subdir = dirname(repoPath);
    } else {
      subdir = repoPath;
    }
  }

  return {
    original: trimmed,
    cloneUrl,
    repoName,
    branch,
    subdir: subdir && subdir !== "." ? subdir : undefined,
    entryFile,
    defaultPrefix: repoName,
  };
}

async function readJsonFile<T>(filePath: string): Promise<T | null> {
  try {
    const content = await readFile(filePath, "utf8");
    return JSON.parse(content) as T;
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readStringRecord(value: unknown): Record<string, string> | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const entries = Object.entries(value).filter((entry): entry is [string, string] => typeof entry[1] === "string");
  return entries.length > 0 ? Object.fromEntries(entries) : {};
}

function parseImportComponentManifestItem(value: unknown): ImportComponentManifestItem | null {
  if (!isRecord(value) || typeof value.source !== "string" || value.source.trim().length === 0) {
    return null;
  }

  if (typeof value.componentExport !== "string" || value.componentExport.trim().length === 0) {
    return null;
  }

  if (typeof value.schema !== "string" || value.schema.trim().length === 0) {
    return null;
  }

  if (typeof value.schemaExport !== "string" || value.schemaExport.trim().length === 0) {
    return null;
  }

  if (typeof value.type !== "string" || value.type.trim().length === 0) {
    return null;
  }

  if (typeof value.label !== "string" || value.label.trim().length === 0) {
    return null;
  }

  return {
    source: value.source.trim(),
    componentExport: value.componentExport.trim(),
    schema: value.schema.trim(),
    schemaExport: value.schemaExport.trim(),
    type: value.type.trim(),
    label: value.label.trim(),
  };
}

function parseImportProjectManifest(value: unknown): ImportProjectManifest | null {
  if (!isRecord(value)) {
    return null;
  }

  const components = Array.isArray(value.components)
    ? value.components.map(parseImportComponentManifestItem).filter((item): item is ImportComponentManifestItem => Boolean(item))
    : undefined;

  return {
    name: typeof value.name === "string" && value.name.trim().length > 0 ? value.name.trim() : undefined,
    version: typeof value.version === "string" && value.version.trim().length > 0 ? value.version.trim() : undefined,
    prefix: typeof value.prefix === "string" && value.prefix.trim().length > 0 ? value.prefix.trim() : undefined,
    componentDir: typeof value.componentDir === "string" && value.componentDir.trim().length > 0 ? value.componentDir.trim() : undefined,
    schemaDir: typeof value.schemaDir === "string" && value.schemaDir.trim().length > 0 ? value.schemaDir.trim() : undefined,
    dependencies: readStringRecord(value.dependencies),
    peerDependencies: readStringRecord(value.peerDependencies),
    components,
  };
}

async function findImportManifest(repoRoot: string): Promise<LoadedImportManifest | undefined> {
  for (const fileName of IMPORT_MANIFEST_FILE_NAMES) {
    const manifestPath = join(repoRoot, fileName);
    const manifest = parseImportProjectManifest(await readJsonFile<unknown>(manifestPath));
    if (manifest) {
      return {
        path: manifestPath,
        manifest,
      };
    }
  }

  return undefined;
}

function buildWrapperSource(componentExportName: string, importPath: string, expectedExportName: string): string {
  return [
    `import type { ComponentType } from "react";`,
    `import type { ElementProps } from "@vitrea/render";`,
    `import * as ImportedModule from "${importPath}";`,
    ``,
    `const importedEntries = ImportedModule as Record<string, unknown> & {`,
    `  default?: ComponentType<Record<string, unknown>>;`,
    `};`,
    ``,
    `const ImportedComponent = (`,
    `  importedEntries["${expectedExportName}"]`,
    `  ?? importedEntries.default`,
    `  ?? Object.values(importedEntries).find((value): value is ComponentType<Record<string, unknown>> => typeof value === "function")`,
    `) as ComponentType<Record<string, unknown>> | undefined;`,
    ``,
    `export function ${componentExportName}({ element, className, style, attrs }: Readonly<ElementProps>) {`,
    `  if (!ImportedComponent) {`,
    `    return (`,
    `      <div {...attrs} className={className ?? ""} style={style}>`,
    `        Imported component unavailable.`,
    `      </div>`,
    `    );`,
    `  }`,
    ``,
    `  const props = (element.data ?? {}) as Record<string, unknown>;`,
    `  return (`,
    `    <div {...attrs} className={className ?? ""} style={style}>`,
    `      <ImportedComponent {...props} />`,
    `    </div>`,
    `  );`,
    `}`,
    ``,
  ].join("\n");
}

function buildElementBridgeSource(elementExportName: string, importPath: string, schemaExportName: string): string {
  return [
    `export { ${schemaExportName} as ${elementExportName} } from "${importPath}";`,
    ``,
  ].join("\n");
}

function upsertImportLines(content: string, importLines: string[]): string {
  const nextImportLines = importLines.filter((line) => !content.includes(line));
  if (nextImportLines.length === 0) {
    return content;
  }

  const matches = [...content.matchAll(/^import .*$/gm)];
  if (matches.length === 0) {
    return `${nextImportLines.join("\n")}\n\n${content}`;
  }

  const lastImport = matches.at(-1);
  if (!lastImport) {
    return `${nextImportLines.join("\n")}\n\n${content}`;
  }
  const insertIndex = (lastImport.index ?? 0) + lastImport[0].length;
  return `${content.slice(0, insertIndex)}\n${nextImportLines.join("\n")}${content.slice(insertIndex)}`;
}

function upsertObjectEntries(content: string, variableName: string, entryLines: string[]): string {
  const pattern = new RegExp(String.raw`const ${variableName}([^=]*)=\s*\{([\s\S]*?)\};`);
  const match = pattern.exec(content);

  if (!match) {
    throw new Error(`Could not update ${variableName} in the registry file.`);
  }

  const typeAnnotation = match[1] ?? "";
  const body = match[2] ?? "";
  const currentLines = body
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const nextLines = [...currentLines];
  for (const entryLine of entryLines) {
    if (!nextLines.includes(entryLine.trim())) {
      nextLines.push(entryLine.trim());
    }
  }

  const replacement = nextLines.length > 0
    ? `const ${variableName}${typeAnnotation}= {\n  ${nextLines.join("\n  ")}\n};`
    : `const ${variableName}${typeAnnotation}= {};`;

  return `${content.slice(0, match.index)}${replacement}${content.slice((match.index ?? 0) + match[0].length)}`;
}

function upsertArrayEntries(content: string, variableName: string, entryNames: string[]): string {
  const pattern = new RegExp(String.raw`const ${variableName}([^=]*)=\s*\[([\s\S]*?)\];`);
  const match = pattern.exec(content);

  if (!match) {
    throw new Error(`Could not update ${variableName} in the schema file.`);
  }

  const typeAnnotation = match[1] ?? "";
  const body = match[2] ?? "";
  const items = body
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  const nextItems = [...items];
  for (const entryName of entryNames) {
    if (!nextItems.includes(entryName)) {
      nextItems.push(entryName);
    }
  }

  const replacement = nextItems.length > 0
    ? `const ${variableName}${typeAnnotation}= [\n  ${nextItems.join(",\n  ")},\n];`
    : `const ${variableName}${typeAnnotation}= [];`;

  return `${content.slice(0, match.index)}${replacement}${content.slice((match.index ?? 0) + match[0].length)}`;
}

async function updateInternalWebPackageJson(projectRoot: string, dependencyVersions: SourceDependencyMap): Promise<{ updated: string[]; unresolved: string[] }> {
  const packageJsonPath = resolve(projectRoot, "internal/web/package.json");
  const packageJson = await readJsonFile<{
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  }>(packageJsonPath);

  if (!packageJson) {
    throw new Error("Could not read internal/web/package.json. Make sure you run this inside a Vitrea project.");
  }

  const dependencies = packageJson.dependencies ? { ...packageJson.dependencies } : {};
  const updated: string[] = [];
  const unresolved: string[] = [];

  for (const [dependencyName, version] of Object.entries(dependencyVersions)) {
    if (!version) {
      unresolved.push(dependencyName);
      continue;
    }

    if (dependencies[dependencyName] !== version) {
      dependencies[dependencyName] = version;
      updated.push(`${dependencyName}@${version}`);
    }
  }

  packageJson.dependencies = Object.fromEntries(
    Object.entries(dependencies).sort(([left], [right]) => left.localeCompare(right)),
  );

  await writeFile(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`, "utf8");
  return { updated, unresolved };
}

function ensureVitreaProject(projectRoot: string): void {
  const webIndexPath = resolve(projectRoot, "internal/web/src/components/index.ts");
  const editorIndexPath = resolve(projectRoot, "internal/editor/src/elements/index.ts");
  const webPackagePath = resolve(projectRoot, "internal/web/package.json");

  for (const filePath of [webIndexPath, editorIndexPath, webPackagePath]) {
    const content = readEnvFile(filePath);
    if (!content) {
      throw new Error("Run `vitrea import-components` inside a scaffolded Vitrea project.");
    }
  }
}

function resolveManifestComponentEntries(
  manifest: ImportProjectManifest,
  repoRoot: string,
  selectedComponentDir: string,
  selectedSchemaDir: string,
): ResolvedComponentEntry[] {
  if (!manifest.components || manifest.components.length === 0) {
    throw new Error("The import manifest must define a non-empty components array.");
  }

  return manifest.components.map((component) => {
    const resolvedComponentPath = resolve(repoRoot, sanitizeRelativeSourcePath(component.source));
    const resolvedSchemaPath = resolve(repoRoot, sanitizeRelativeSourcePath(component.schema));
    if (!isPathInsideDirectory(resolvedComponentPath, selectedComponentDir)) {
      throw new Error(`The manifest component "${component.source}" must be inside "${manifest.componentDir}".`);
    }
    if (!isPathInsideDirectory(resolvedSchemaPath, selectedSchemaDir)) {
      throw new Error(`The manifest schema "${component.schema}" must be inside "${manifest.schemaDir}".`);
    }

    return {
      filePath: resolvedComponentPath,
      componentExportName: component.componentExport,
      schemaFilePath: resolvedSchemaPath,
      schemaExportName: component.schemaExport,
      type: component.type,
      label: component.label,
    };
  });
}

function collectManifestDependencies(manifest?: ImportProjectManifest): SourceDependencyMap {
  if (!manifest) {
    return {};
  }

  return Object.fromEntries([
    ...Object.entries(manifest.dependencies ?? {}),
    ...Object.entries(manifest.peerDependencies ?? {}),
  ]);
}

function buildGeneratedComponent(
  {
    prefix,
    sourceRootName,
    schemaRootName,
    selectedDir,
    sourceFilePath,
    selectedSchemaDir,
    schemaFilePath,
    targetWebRoot,
    targetEditorRoot,
    typeOverride,
    labelOverride,
    expectedComponentExportName,
    expectedSchemaExportName,
  }: {
    prefix: string;
    sourceRootName: string;
    schemaRootName: string;
    selectedDir: string;
    sourceFilePath: string;
    selectedSchemaDir: string;
    schemaFilePath: string;
    targetWebRoot: string;
    targetEditorRoot: string;
    typeOverride?: string;
    labelOverride?: string;
    expectedComponentExportName: string;
    expectedSchemaExportName: string;
  },
): GeneratedComponent {
  const relativeComponentPath = sanitizeRelativeSourcePath(relative(selectedDir, sourceFilePath));
  const relativeSchemaPath = sanitizeRelativeSourcePath(relative(selectedSchemaDir, schemaFilePath));
  const componentSlug = normalizeName(typeOverride ?? `${prefix}-${stripExtension(relativeComponentPath).replaceAll("/", "-")}`);
  const type = componentSlug;
  const label = labelOverride ?? humanizeSlug(componentSlug);
  const componentExportName = `${toPascalCase(componentSlug)}Component`;
  const elementExportName = `${toCamelCase(componentSlug)}Element`;
  const wrapperFilePath = resolve(targetWebRoot, `${componentSlug}.tsx`);
  const elementFilePath = resolve(targetEditorRoot, `${componentSlug}.ts`);
  const relativeSourceImport = `./${sourceRootName}/${stripExtension(relativeComponentPath)}`;
  const relativeSchemaImport = `./${schemaRootName}/${stripExtension(relativeSchemaPath)}`;

  return {
    type,
    label,
    componentExportName,
    elementExportName,
    wrapperImportLine: `import { ${componentExportName} } from "./imported/${componentSlug}";`,
    wrapperRegistryLine: `"${type}": ${componentExportName},`,
    elementImportLine: `import { ${elementExportName} } from "./imported/${componentSlug}";`,
    elementRegistryLine: elementExportName,
    wrapperFilePath,
    elementFilePath,
    sourceFilePath,
    relativeSourceImport,
    relativeSchemaImport,
    expectedComponentExportName,
    expectedSchemaExportName,
  };
}

export async function importComponentsFromRepository({
  projectRoot,
  source,
  branch,
}: {
  projectRoot: string;
  source: ImportSourceInfo;
  branch?: string;
}): Promise<ImportComponentsResult> {
  ensureVitreaProject(projectRoot);

  const tempDir = await mkdtemp(join(tmpdir(), "vitrea-import-"));
  const cloneDir = join(tempDir, "repo");

  try {
    const cloneArgs = ["clone", "--depth", "1"];
    if (branch ?? source.branch) {
      cloneArgs.push("--branch", branch ?? source.branch ?? "");
    }
    cloneArgs.push(source.cloneUrl, cloneDir);
    await runCommand("git", cloneArgs, tempDir);

    const loadedManifest = await findImportManifest(cloneDir);
    if (!loadedManifest) {
      throw new Error(`No import manifest was found. Add ${IMPORT_MANIFEST_FILE_NAMES.join(" or ")} to the source repository.`);
    }

    const manifest = loadedManifest.manifest;
    if (!manifest.componentDir) {
      throw new Error("The import manifest must define componentDir.");
    }

    if (!manifest.schemaDir) {
      throw new Error("The import manifest must define schemaDir.");
    }

    if (!manifest.prefix) {
      throw new Error("The import manifest must define prefix.");
    }

    const resolvedComponentDir = sanitizeRelativeSourcePath(manifest.componentDir);
    const resolvedSchemaDir = sanitizeRelativeSourcePath(manifest.schemaDir);
    const workingPrefix = normalizeName(manifest.prefix);
    const selectedComponentDir = resolve(cloneDir, resolvedComponentDir);
    const selectedSchemaDir = resolve(cloneDir, resolvedSchemaDir);
    const selectedComponentDirStats = await stat(selectedComponentDir).catch(() => null);
    const selectedSchemaDirStats = await stat(selectedSchemaDir).catch(() => null);
    if (!selectedComponentDirStats?.isDirectory()) {
      throw new Error(`Could not find the directory "${resolvedComponentDir}" in ${source.original}.`);
    }
    if (!selectedSchemaDirStats?.isDirectory()) {
      throw new Error(`Could not find the directory "${resolvedSchemaDir}" in ${source.original}.`);
    }

    const resolvedComponentEntries = resolveManifestComponentEntries(manifest, cloneDir, selectedComponentDir, selectedSchemaDir);

    const sourceRootName = `${workingPrefix}-source`;
    const schemaRootName = `${workingPrefix}-schemas`;
    const targetWebImportRoot = resolve(projectRoot, "internal/web/src/components/imported");
    const targetEditorImportRoot = resolve(projectRoot, "internal/editor/src/elements/imported");
    const targetSourceRoot = resolve(targetWebImportRoot, sourceRootName);
    const targetSchemaRoot = resolve(targetEditorImportRoot, schemaRootName);

    await mkdir(targetWebImportRoot, { recursive: true });
    await mkdir(targetEditorImportRoot, { recursive: true });
    await rm(targetSourceRoot, { recursive: true, force: true });
    await rm(targetSchemaRoot, { recursive: true, force: true });
    await cp(selectedComponentDir, targetSourceRoot, { recursive: true, force: true });
    await cp(selectedSchemaDir, targetSchemaRoot, { recursive: true, force: true });

    const generatedComponents: GeneratedComponent[] = [];
    for (const componentEntry of resolvedComponentEntries) {
      const generated = buildGeneratedComponent({
        prefix: workingPrefix,
        sourceRootName,
        schemaRootName,
        selectedDir: selectedComponentDir,
        sourceFilePath: componentEntry.filePath,
        selectedSchemaDir,
        schemaFilePath: componentEntry.schemaFilePath,
        targetWebRoot: targetWebImportRoot,
        targetEditorRoot: targetEditorImportRoot,
        typeOverride: componentEntry.type,
        labelOverride: componentEntry.label,
        expectedComponentExportName: componentEntry.componentExportName,
        expectedSchemaExportName: componentEntry.schemaExportName,
      });

      await writeFile(
        generated.wrapperFilePath,
        buildWrapperSource(generated.componentExportName, generated.relativeSourceImport, generated.expectedComponentExportName),
        "utf8",
      );
      await writeFile(
        generated.elementFilePath,
        buildElementBridgeSource(generated.elementExportName, generated.relativeSchemaImport, generated.expectedSchemaExportName),
        "utf8",
      );

      generatedComponents.push(generated);
    }

    const webIndexPath = resolve(projectRoot, "internal/web/src/components/index.ts");
    const editorIndexPath = resolve(projectRoot, "internal/editor/src/elements/index.ts");
    const webIndexContent = await readFile(webIndexPath, "utf8");
    const editorIndexContent = await readFile(editorIndexPath, "utf8");

    const nextWebIndex = upsertObjectEntries(
      upsertImportLines(webIndexContent, generatedComponents.map((component) => component.wrapperImportLine)),
      "customComponents",
      generatedComponents.map((component) => component.wrapperRegistryLine),
    );
    const nextEditorIndex = upsertArrayEntries(
      upsertImportLines(editorIndexContent, generatedComponents.map((component) => component.elementImportLine)),
      "customElements",
      generatedComponents.map((component) => component.elementRegistryLine),
    );

    await writeFile(webIndexPath, nextWebIndex, "utf8");
    await writeFile(editorIndexPath, nextEditorIndex, "utf8");

    const resolvedDependencies = collectManifestDependencies(manifest);
    const dependencyResult = await updateInternalWebPackageJson(projectRoot, resolvedDependencies);

    return {
      imported: generatedComponents.map((component) => ({
        type: component.type,
        label: component.label,
        wrapperPath: relative(projectRoot, component.wrapperFilePath),
        elementPath: relative(projectRoot, component.elementFilePath),
      })),
      dependencyUpdates: [...dependencyResult.updated].sort(sortStrings),
      unresolvedDependencies: [...new Set(dependencyResult.unresolved)].sort(sortStrings),
      targetDirectory: resolvedComponentDir,
      usedPrefix: workingPrefix,
      manifest: {
        path: relative(projectRoot, loadedManifest.path),
        name: loadedManifest.manifest.name,
        version: loadedManifest.manifest.version,
      },
    };
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}
