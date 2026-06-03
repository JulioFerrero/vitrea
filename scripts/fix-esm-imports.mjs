import { existsSync, statSync } from "node:fs";
import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import { dirname, extname, join, relative, resolve } from "node:path";
import process from "node:process";

const targetDir = process.argv[2];

if (!targetDir) {
  console.error("Usage: node scripts/fix-esm-imports.mjs <dist-dir>");
  process.exit(1);
}

const JS_EXTENSIONS = new Set([".js", ".mjs", ".cjs", ".json", ".node"]);

function isRelativeSpecifier(specifier) {
  return specifier.startsWith("./") || specifier.startsWith("../");
}

function stripRuntimeExtension(specifier) {
  const extension = extname(specifier);
  if (!JS_EXTENSIONS.has(extension)) {
    return specifier;
  }
  return specifier.slice(0, -extension.length);
}

function resolveJsSpecifier(filePath, specifier) {
  const normalizedSpecifier = stripRuntimeExtension(specifier);
  const currentTarget = resolve(dirname(filePath), specifier);
  if (existsSync(currentTarget) && statSync(currentTarget).isFile()) {
    return specifier;
  }

  const basePath = resolve(dirname(filePath), normalizedSpecifier);
  const fileCandidate = `${basePath}.js`;
  if (existsSync(fileCandidate)) {
    return `${normalizedSpecifier}.js`;
  }

  const indexCandidate = join(basePath, "index.js");
  if (existsSync(indexCandidate)) {
    return `${normalizedSpecifier}/index.js`;
  }

  return specifier;
}

function rewriteSpecifiers(filePath, source) {
  const fromPattern = /(from\s+)(["'])(\.\.?(?:\/[^"'`]+)+)\2/g;
  const importPattern = /(import\s*\(\s*)(["'])(\.\.?(?:\/[^"'`]+)+)\2(\s*\))/g;

  let output = source.replace(fromPattern, (full, prefix, quote, specifier) => {
    if (!isRelativeSpecifier(specifier)) return full;
    const resolvedSpecifier = resolveJsSpecifier(filePath, specifier);
    return resolvedSpecifier === specifier ? full : `${prefix}${quote}${resolvedSpecifier}${quote}`;
  });

  output = output.replace(importPattern, (full, prefix, quote, specifier, suffix) => {
    if (!isRelativeSpecifier(specifier)) return full;
    const resolvedSpecifier = resolveJsSpecifier(filePath, specifier);
    return resolvedSpecifier === specifier ? full : `${prefix}${quote}${resolvedSpecifier}${quote}${suffix}`;
  });

  return output;
}

async function walk(dir, files = []) {
  for (const entry of await readdir(dir)) {
    const filePath = join(dir, entry);
    const info = await stat(filePath);
    if (info.isDirectory()) {
      await walk(filePath, files);
    } else if (filePath.endsWith(".js")) {
      files.push(filePath);
    }
  }
  return files;
}

const root = join(process.cwd(), targetDir);
const jsFiles = await walk(root);

for (const filePath of jsFiles) {
  const original = await readFile(filePath, "utf8");
  const updated = rewriteSpecifiers(filePath, original);
  if (updated !== original) {
    await writeFile(filePath, updated, "utf8");
    console.log(relative(process.cwd(), filePath));
  }
}
