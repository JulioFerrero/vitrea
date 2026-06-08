#!/usr/bin/env node

import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import process from "node:process";
import { spawn } from "node:child_process";

const repoRoot = resolve(import.meta.dirname, "..");
const packagesDir = resolve(repoRoot, "packages");

function parseArgs(argv) {
  return {
    dryRun: argv.includes("--dry-run"),
    noBuild: argv.includes("--no-build"),
  };
}

async function run(command, args, options = {}) {
  await new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(command, args, {
      cwd: options.cwd ?? repoRoot,
      stdio: "inherit",
      shell: process.platform === "win32",
      env: {
        ...process.env,
        ...options.env,
      },
    });

    child.on("exit", (code) => {
      if (code === 0) {
        resolvePromise();
        return;
      }

      rejectPromise(new Error(`${command} ${args.join(" ")} failed with exit code ${String(code)}`));
    });

    child.on("error", rejectPromise);
  });
}

async function listWorkspacePackages() {
  const entries = await readdir(packagesDir, { withFileTypes: true });
  const packages = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const packageJsonPath = resolve(packagesDir, entry.name, "package.json");
    const packageJson = JSON.parse(await readFile(packageJsonPath, "utf8"));

    if (packageJson.private) {
      continue;
    }

    const dependencies = {};
    if (packageJson.dependencies) {
      Object.assign(dependencies, packageJson.dependencies);
    }
    if (packageJson.optionalDependencies) {
      Object.assign(dependencies, packageJson.optionalDependencies);
    }
    if (packageJson.peerDependencies) {
      Object.assign(dependencies, packageJson.peerDependencies);
    }

    packages.push({
      name: packageJson.name,
      version: packageJson.version,
      dir: resolve(packagesDir, entry.name),
      dependencies,
    });
  }

  return packages;
}

async function getPublishedVersions(packageName) {
  const stdout = [];
  const stderr = [];

  return await new Promise((resolvePromise, rejectPromise) => {
    const child = spawn("npm", ["view", packageName, "versions", "--json", "--silent"], {
      cwd: repoRoot,
      stdio: ["ignore", "pipe", "pipe"],
      shell: process.platform === "win32",
    });

    child.stdout.on("data", (chunk) => {
      stdout.push(chunk.toString());
    });

    child.stderr.on("data", (chunk) => {
      stderr.push(chunk.toString());
    });

    child.on("exit", (code) => {
      const stdoutText = stdout.join("").trim();
      const stderrText = stderr.join("").trim();

      if (code === 0) {
        if (!stdoutText) {
          resolvePromise(undefined);
          return;
        }

        try {
          const parsed = JSON.parse(stdoutText);
          if (Array.isArray(parsed)) {
            resolvePromise(parsed);
            return;
          }

          if (typeof parsed === "string") {
            resolvePromise([parsed]);
            return;
          }

          resolvePromise(undefined);
        } catch {
          resolvePromise(undefined);
        }
        return;
      }

      if (stderrText.includes("E404")) {
        resolvePromise(undefined);
        return;
      }

      rejectPromise(new Error(`npm view ${packageName} failed:\n${stderrText || stdoutText}`));
    });

    child.on("error", rejectPromise);
  });
}

function compareVersions(left, right) {
  const leftParts = left.split(".").map((value) => Number.parseInt(value, 10));
  const rightParts = right.split(".").map((value) => Number.parseInt(value, 10));
  const maxLength = Math.max(leftParts.length, rightParts.length);

  for (let index = 0; index < maxLength; index += 1) {
    const leftValue = leftParts[index] ?? 0;
    const rightValue = rightParts[index] ?? 0;

    if (leftValue > rightValue) {
      return 1;
    }

    if (leftValue < rightValue) {
      return -1;
    }
  }

  return 0;
}

function sortByInternalDependencies(packages) {
  const packageMap = new Map(packages.map((pkg) => [pkg.name, pkg]));
  const visiting = new Set();
  const visited = new Set();
  const ordered = [];

  function visit(packageName) {
    if (visited.has(packageName)) {
      return;
    }

    if (visiting.has(packageName)) {
      throw new Error(`Circular workspace dependency detected for ${packageName}`);
    }

    const pkg = packageMap.get(packageName);
    if (!pkg) {
      return;
    }

    visiting.add(packageName);

    for (const dependencyName of Object.keys(pkg.dependencies)) {
      if (packageMap.has(dependencyName)) {
        visit(dependencyName);
      }
    }

    visiting.delete(packageName);
    visited.add(packageName);
    ordered.push(pkg);
  }

  for (const pkg of packages) {
    visit(pkg.name);
  }

  return ordered;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const workspacePackages = await listWorkspacePackages();
  const packagesToPublish = [];

  for (const pkg of workspacePackages) {
    const publishedVersions = await getPublishedVersions(pkg.name);
    const publishedVersion = publishedVersions?.at(-1);

    const isVersionAlreadyPublished = publishedVersions?.includes(pkg.version) ?? false;
    if (!isVersionAlreadyPublished && (!publishedVersion || compareVersions(pkg.version, publishedVersion) > 0)) {
      packagesToPublish.push({
        ...pkg,
        publishedVersion,
      });
    }
  }

  if (packagesToPublish.length === 0) {
    console.log("No @vitrea packages have a newer local version than npm.");
    return;
  }

  const orderedPackages = sortByInternalDependencies(packagesToPublish);

  console.log("Packages queued for publish:");
  for (const pkg of orderedPackages) {
    const publishedLabel = pkg.publishedVersion ?? "not published";
    console.log(`- ${pkg.name} ${publishedLabel} -> ${pkg.version}`);
  }

  if (!options.noBuild) {
    const buildArgs = ["-r"];
    for (const pkg of orderedPackages) {
      buildArgs.push("--filter", pkg.name);
    }
    buildArgs.push("run", "build");

    console.log("\nBuilding selected packages...\n");
    await run("pnpm", buildArgs);
  }

  if (options.dryRun) {
    console.log("\nSimulating publish with pnpm publish --dry-run...\n");

    for (const pkg of orderedPackages) {
      console.log(`\nDry run for ${pkg.name}@${pkg.version}\n`);
      await run("pnpm", ["publish", "--dry-run", "--access", "public", "--no-git-checks"], {
        cwd: pkg.dir,
      });
    }
    return;
  }

  console.log("\nPublishing with Changesets...\n");
  await run("pnpm", ["changeset", "publish"]);
}

try {
  await main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
