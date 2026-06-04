#!/usr/bin/env node

import "dotenv/config";
import { spawn } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { basename, resolve } from "node:path";
import process from "node:process";
import { setTimeout as delay } from "node:timers/promises";
import { parseArgs } from "node:util";
import prompts from "prompts";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { closeDatabase, db, pages, sites } from "@vitrea/database";

function onCancel() {
  throw new Error("Setup cancelled");
}

function readEnvFile(envPath) {
  try {
    return readFileSync(envPath, "utf8");
  } catch {
    return "";
  }
}

function upsertEnvValue(content, key, value) {
  const line = `${key}=${value}`;
  const pattern = new RegExp(`^${key}=.*$`, "m");
  if (pattern.test(content)) {
    return content.replace(pattern, line);
  }
  const suffix = content.endsWith("\n") || content.length === 0 ? "" : "\n";
  return content + suffix + line + "\n";
}

function writeEnvValues(envPath, values) {
  let content = readEnvFile(envPath);
  for (const [key, value] of Object.entries(values)) {
    content = upsertEnvValue(content, key, value);
  }
  writeFileSync(envPath, content, "utf8");
}

function normalizeName(value) {
  const normalized = value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return normalized || "vitrea-site";
}

async function run(command, args, cwd, description) {
  if (description) {
    console.log(`\n  -> ${description}`);
  }

  await new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(command, args, {
      cwd,
      stdio: "inherit",
      shell: process.platform === "win32",
    });

    child.on("exit", (code) => {
      if (code === 0) {
        resolvePromise();
        return;
      }
      rejectPromise(new Error(`${description ?? `${command} ${args.join(" ")}`} failed`));
    });
    child.on("error", rejectPromise);
  });
}

async function runSetup({ cwd, siteName }) {
  const envPath = resolve(cwd, ".env");
  const databaseName = normalizeName(siteName);

  console.log("\n  Project setup\n");

  const { choice: databaseChoice } = await prompts({
    type: "select",
    name: "choice",
    message: "Database setup",
    choices: [
      { title: "Use local Docker Postgres", value: "local" },
      { title: "Use an existing PostgreSQL database", value: "existing" },
      { title: "Skip for now", value: "skip" },
    ],
    initial: 0,
  }, { onCancel });

  if (databaseChoice !== "skip") {
    if (databaseChoice === "local") {
      writeEnvValues(envPath, {
        DATABASE_URL: `postgresql://hi:hi@localhost:5432/${databaseName}`,
      });
      await run("docker", ["compose", "up", "-d", "postgres"], cwd, "starting local Postgres");
      await delay(5000);
    } else {
      const current = readEnvFile(envPath).match(/^DATABASE_URL=(.*)$/m)?.[1] ?? "";
      const response = await prompts({
        type: "text",
        name: "databaseUrl",
        message: "PostgreSQL connection string",
        initial: current,
        validate: (value) => value.trim().length > 0 || "DATABASE_URL is required",
      }, { onCancel });
      writeEnvValues(envPath, { DATABASE_URL: response.databaseUrl.trim() });
    }

    const migrations = await prompts({
      type: "confirm",
      name: "runMigrations",
      message: "Push the database schema now?",
      initial: true,
    }, { onCancel });

    if (migrations.runMigrations) {
      await run("pnpm", ["db:push"], cwd, "pushing database schema");
    }

    const seed = await prompts({
      type: "confirm",
      name: "seedStarterData",
      message: "Create starter site data now?",
      initial: true,
    }, { onCancel });

    if (seed.seedStarterData) {
      await run("pnpm", ["db:seed"], cwd, "creating starter site data");
    }
  }

  const { choice: storageChoice } = await prompts({
    type: "select",
    name: "choice",
    message: "Asset storage setup",
    choices: [
      { title: "Run local S3 with SeaweedFS", value: "local" },
      { title: "Use an existing S3-compatible storage", value: "existing" },
      { title: "Skip for now", value: "skip" },
    ],
    initial: 0,
  }, { onCancel });

  if (storageChoice === "skip") {
    writeEnvValues(envPath, {
      S3_ENDPOINT: "",
      S3_REGION: "us-east-1",
      S3_BUCKET: "",
      S3_ACCESS_KEY: "",
      S3_SECRET_KEY: "",
      S3_FORCE_PATH_STYLE: "false",
    });
    return;
  }

  if (storageChoice === "local") {
    writeEnvValues(envPath, {
      S3_ENDPOINT: "http://localhost:8333",
      S3_REGION: "us-east-1",
      S3_BUCKET: "images",
      S3_ACCESS_KEY: "admin",
      S3_SECRET_KEY: "secret",
      S3_FORCE_PATH_STYLE: "true",
    });
    await run("docker", ["compose", "up", "-d", "seaweedfs"], cwd, "starting local SeaweedFS");
    return;
  }

  const currentEnv = readEnvFile(envPath);
  const response = await prompts([
    {
      type: "text",
      name: "endpoint",
      message: "S3 endpoint (leave blank for AWS S3)",
      initial: currentEnv.match(/^S3_ENDPOINT=(.*)$/m)?.[1] ?? "",
    },
    {
      type: "text",
      name: "region",
      message: "S3 region",
      initial: currentEnv.match(/^S3_REGION=(.*)$/m)?.[1] ?? "us-east-1",
    },
    {
      type: "text",
      name: "bucket",
      message: "S3 bucket",
      initial: currentEnv.match(/^S3_BUCKET=(.*)$/m)?.[1] ?? "",
      validate: (value) => value.trim().length > 0 || "S3 bucket is required",
    },
    {
      type: "text",
      name: "accessKey",
      message: "S3 access key",
      initial: currentEnv.match(/^S3_ACCESS_KEY=(.*)$/m)?.[1] ?? "",
    },
    {
      type: "text",
      name: "secretKey",
      message: "S3 secret key",
      initial: currentEnv.match(/^S3_SECRET_KEY=(.*)$/m)?.[1] ?? "",
    },
    {
      type: "confirm",
      name: "forcePathStyle",
      message: "Use path-style S3 URLs?",
      initial: (currentEnv.match(/^S3_FORCE_PATH_STYLE=(.*)$/m)?.[1] ?? "false") === "true",
    },
  ], { onCancel });

  writeEnvValues(envPath, {
    S3_ENDPOINT: response.endpoint.trim(),
    S3_REGION: response.region.trim(),
    S3_BUCKET: response.bucket.trim(),
    S3_ACCESS_KEY: response.accessKey.trim(),
    S3_SECRET_KEY: response.secretKey.trim(),
    S3_FORCE_PATH_STYLE: response.forcePathStyle ? "true" : "false",
  });
}

async function runSeed({ cwd, siteName }) {
  const envPath = resolve(cwd, ".env");

  try {
    const [existingSite] = await db.select().from(sites).limit(1);
    const siteSlug = normalizeName(siteName);

    const site = existingSite ?? (await db.insert(sites).values({
      id: nanoid(),
      slug: siteSlug,
      data: { name: siteName },
    }).returning())[0];

    const [existingHomePage] = await db
      .select()
      .from(pages)
      .where(eq(pages.siteId, site.id))
      .limit(1);

    if (!existingHomePage) {
      await db.insert(pages).values({
        id: nanoid(),
        siteId: site.id,
        slug: "home",
        data: { title: "Home", path: "/", status: "published" },
        content: [],
        pubContent: [],
      });
    }

    writeEnvValues(envPath, {
      WEBSITE_ID: site.id,
      SITE_ID: site.id,
    });

    console.log(`Starter data ready. WEBSITE_ID=${site.id}`);
  } finally {
    await closeDatabase();
  }
}

const [command, ...rest] = process.argv.slice(2);
const { values } = parseArgs({
  args: rest,
  options: {
    cwd: { type: "string" },
    "site-name": { type: "string" },
  },
  allowPositionals: false,
});

const cwd = resolve(values.cwd ?? process.cwd());
const siteName = values["site-name"] ?? basename(cwd);

if (command === "setup") {
  await runSetup({ cwd, siteName });
} else if (command === "seed") {
  await runSeed({ cwd, siteName });
} else {
  console.error('Usage: vitrea <setup|seed> [--site-name "My Site"] [--cwd /path/to/project]');
  process.exit(1);
}
