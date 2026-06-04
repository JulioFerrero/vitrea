#!/usr/bin/env node

import { randomBytes } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { parseArgs } from "node:util";
import { basename, resolve } from "node:path";
import { spawn } from "node:child_process";
import process from "node:process";
import { setTimeout as delay } from "node:timers/promises";
import pc from "picocolors";
import prompts from "prompts";
import { config as loadDotenv } from "dotenv";
import { eq } from "drizzle-orm";
import { parseFlags, promptInteractive } from "./prompts";
import { listFiles, scaffold } from "./scaffold";

function onCancel(): never {
  throw new Error("Prompt cancelled");
}

function readEnvFile(envPath: string): string {
  try {
    return readFileSync(envPath, "utf8");
  } catch {
    return "";
  }
}

function upsertEnvValue(content: string, key: string, value: string): string {
  const line = `${key}=${value}`;
  const pattern = new RegExp(`^${key}=.*$`, "m");
  if (pattern.test(content)) {
    return content.replace(pattern, line);
  }
  const suffix = content.endsWith("\n") || content.length === 0 ? "" : "\n";
  return content + suffix + line + "\n";
}

function writeEnvValues(envPath: string, values: Record<string, string>): void {
  let content = readEnvFile(envPath);
  for (const [key, value] of Object.entries(values)) {
    content = upsertEnvValue(content, key, value);
  }
  writeFileSync(envPath, content, "utf8");
}

function normalizeName(value: string): string {
  const normalized = value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return normalized || "vitrea-site";
}

function createId(): string {
  return randomBytes(16).toString("base64url").slice(0, 21);
}

async function run(command: string, args: string[], cwd: string): Promise<void> {
  await new Promise<void>((resolvePromise, rejectPromise) => {
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
      rejectPromise(new Error(`${command} ${args.join(" ")} failed`));
    });
    child.on("error", rejectPromise);
  });
}

async function runSetup({ cwd, siteName }: { cwd: string; siteName: string }) {
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
      await run("docker", ["compose", "up", "-d", "postgres"], cwd);
      await delay(5000);
    } else {
      const current = readEnvFile(envPath).match(/^DATABASE_URL=(.*)$/m)?.[1] ?? "";
      const response = await prompts({
        type: "text",
        name: "databaseUrl",
        message: "PostgreSQL connection string",
        initial: current,
        validate: (value: string) => value.trim().length > 0 || "DATABASE_URL is required",
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
      await run("pnpm", ["db:push"], cwd);
    }

    const seed = await prompts({
      type: "confirm",
      name: "seedStarterData",
      message: "Create starter site data now?",
      initial: true,
    }, { onCancel });

    if (seed.seedStarterData) {
      await run("pnpm", ["db:seed"], cwd);
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
    await run("docker", ["compose", "up", "-d", "seaweedfs"], cwd);
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
      validate: (value: string) => value.trim().length > 0 || "S3 bucket is required",
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

async function runSeed({ cwd, siteName }: { cwd: string; siteName: string }) {
  const envPath = resolve(cwd, ".env");
  loadDotenv({ path: envPath });

  const databaseModuleName = "@vitrea/database";
  const { closeDatabase, db, pages, sites } = await import(databaseModuleName) as {
    closeDatabase: () => Promise<void>;
    db: {
      select: () => {
        from: (table: unknown) => {
          limit: (count: number) => Promise<Array<Record<string, unknown>>>;
          where: (condition: unknown) => { limit: (count: number) => Promise<Array<Record<string, unknown>>> };
        };
      };
      insert: (table: unknown) => {
        values: (value: Record<string, unknown>) => { returning: () => Promise<Array<Record<string, unknown>>> };
      };
    };
    pages: { siteId: unknown };
    sites: unknown;
  };

  try {
    const [existingSite] = await db.select().from(sites).limit(1);
    const siteSlug = normalizeName(siteName);

    const site = existingSite ?? (await db.insert(sites).values({
      id: createId(),
      slug: siteSlug,
      data: { name: siteName },
    }).returning())[0];

    const [existingHomePage] = await db
      .select()
      .from(pages)
      .where(eq((pages as { siteId: unknown }).siteId as never, site.id))
      .limit(1);

    if (!existingHomePage) {
      await db.insert(pages).values({
        id: createId(),
        siteId: site.id as string,
        slug: "home",
        data: { title: "Home", path: "/", status: "published" },
        content: [],
        pubContent: [],
      });
    }

    writeEnvValues(envPath, {
      WEBSITE_ID: site.id as string,
      SITE_ID: site.id as string,
    });

    console.log(`Starter data ready. WEBSITE_ID=${String(site.id)}`);
  } finally {
    await closeDatabase();
  }
}

async function runScaffold(args: string[]) {
  const { values, positionals } = parseArgs({
    args,
    options: {
      dir: { type: "string", short: "d" },
      preview: { type: "boolean", short: "p", default: false },
    },
    allowPositionals: true,
  });

  const answers = parseFlags(args) ?? await promptInteractive();

  const hasName = args.some((arg) => arg === "--name" || arg === "-n");
  if (!hasName) {
    console.log(`\n  ${pc.bold("Vitrea")} Let's set up your Editor project.\n`);
  }

  const explicitTarget = values.dir ?? positionals[0];
  const targetDir = explicitTarget
    ? resolve(explicitTarget)
    : resolve(".", answers.projectName);

  if (values.preview) {
    console.log(`\n  ${pc.yellow(pc.bold("PREVIEW"))} - no files will be written\n`);
    console.log(`  ${pc.bold("Would create:")} ${pc.cyan(`${targetDir}/`)}\n`);
    console.log(`  ${pc.gray(`${answers.projectName}/`)}`);
    console.log(`  ${pc.gray("  |- apps/")}`);
    console.log(`  ${pc.gray(`  |  |- web/          ${answers.framework} website`)}`);
    console.log(`  ${pc.gray("  |  |- editor/       visual editor")}`);
    console.log(`  ${pc.gray("  |- package.json")}`);
    console.log(`  ${pc.gray("  |- pnpm-workspace.yaml")}`);
    console.log("");

    console.log(`  ${pc.bold("Selected:")}`);
    console.log(`    Environment: ${answers.environment}`);
    console.log(`    Framework:   ${answers.framework}`);
    console.log(`    Storage:     ${answers.storage}`);
    if (answers.cloudProvider) console.log(`    Cloud:       ${answers.cloudProvider}`);
    console.log(`    Examples:    ${answers.includeExamples}`);
    console.log(`    Git:         ${answers.initGit}`);
    console.log(`    Run setup:   ${answers.startNow}`);
    console.log("");

    const files = listFiles(answers);
    console.log(`  ${pc.bold("Files:")}\n`);
    for (const file of files) {
      console.log(`    ${pc.cyan(file)}`);
    }
    console.log("");
    process.exit(0);
  }

  await mkdir(targetDir, { recursive: true });
  await scaffold(targetDir, answers);

  console.log(`\n  ${pc.green(pc.bold("Ready!"))} Created at ${pc.cyan(`${targetDir}/`)}`);

  let installed = false;
  let ranLocalSetup = false;
  if (answers.environment === "local") {
    const runSetupNow = answers.startNow || (await prompts({
      type: "confirm",
      name: "runSetupNow",
      message: "Install dependencies and run local setup now?",
      initial: true,
    }, { onCancel })).runSetupNow;

    if (runSetupNow) {
      installed = true;
      ranLocalSetup = true;
      console.log(`\n  ${pc.bold("Installing dependencies...")}\n`);
      await run("pnpm", ["install"], targetDir);
      console.log(`\n  ${pc.bold("Running setup...")}\n`);
      await run("pnpm", ["setup"], targetDir);
    }
  }

  if (!ranLocalSetup) {
    console.log(`\n  ${pc.bold("Next steps:")}\n`);
    const cdTarget = explicitTarget ? basename(targetDir) || "." : answers.projectName;
    const step = (index: number, command: string, description: string) =>
      `  ${pc.gray(`${index}.`)}  ${pc.cyan(command)}${description ? `  ${pc.gray(description)}` : ""}`;

    if (answers.environment === "local") {
      console.log(step(1, `cd ${cdTarget}`, ""));
      console.log(step(2, "pnpm install", "install dependencies"));
      console.log(step(3, "pnpm setup", "choose database and storage"));
      console.log(step(4, "pnpm dev", "start editor and website"));
    } else if (answers.environment === "vps") {
      console.log(step(1, "pnpm install", "install dependencies"));
      console.log(step(2, "Edit .env", "set passwords and domain"));
      console.log(step(3, "docker compose up -d", "start services"));
      console.log(step(4, "pnpm db:push", "push schema"));
      console.log(step(5, "pnpm db:seed", "seed starter data"));
    } else if (answers.cloudProvider === "vercel") {
      console.log(step(1, "pnpm install", "install dependencies"));
      console.log(step(2, "Create a Neon DB", "connect database"));
      console.log(step(3, "vercel link", "connect to Vercel"));
      console.log(step(4, "vercel deploy", "deploy"));
    } else if (answers.cloudProvider === "railway") {
      console.log(step(1, "pnpm install", "install dependencies"));
      console.log(step(2, "Push to GitHub", "connect at railway.app"));
      console.log(step(3, "Add PostgreSQL", "in Railway dashboard"));
      console.log(step(4, "Set env vars", "BETTER_AUTH_SECRET and storage values"));
    } else if (answers.cloudProvider === "fly") {
      console.log(step(1, "pnpm install", "install dependencies"));
      console.log(step(2, "fly launch", "create the app"));
      console.log(step(3, "fly postgres create", "add database"));
      console.log(step(4, "fly deploy", "deploy"));
    }
  } else if (installed) {
    console.log(`\n  ${pc.bold("Next step:")}\n`);
    console.log(`  ${pc.gray("1.")}  ${pc.cyan(`cd ${basename(targetDir)} && pnpm dev`)}  ${pc.gray("start editor and website")}`);
  }
  console.log("");
}

const argv = process.argv.slice(2);
const [command, ...rest] = argv;

if (command === "setup" || command === "seed") {
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
  } else {
    await runSeed({ cwd, siteName });
  }
} else {
  await runScaffold(argv);
}
