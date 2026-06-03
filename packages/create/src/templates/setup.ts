import type { PromptAnswers } from "../prompts";

export function drizzleConfigTs(): string {
  return `import "dotenv/config";
import { defineConfig } from "drizzle-kit";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: connectionString,
  },
});
`;
}

export function drizzleSchemaTs(): string {
  return `export * from "@vitrea/database/schema";
`;
}

export function setupScriptTs(answers: PromptAnswers): string {
  return `import "dotenv/config";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import prompts from "prompts";
import { spawn } from "node:child_process";

type DatabaseChoice = "local" | "existing" | "skip";
type StorageChoice = "local" | "existing" | "skip";

const rootDir = resolve(import.meta.dirname, "..");
const envPath = resolve(rootDir, ".env");

function readEnvFile(): string {
  try {
    return readFileSync(envPath, "utf8");
  } catch {
    return "";
  }
}

function upsertEnvValue(content: string, key: string, value: string): string {
  const line = \`\${key}=\${value}\`;
  const pattern = new RegExp(\`^\${key}=.*$\`, "m");
  if (pattern.test(content)) {
    return content.replace(pattern, line);
  }
  const suffix = content.endsWith("\\n") || content.length === 0 ? "" : "\\n";
  return content + suffix + line + "\\n";
}

function writeEnvValues(values: Record<string, string>): void {
  let content = readEnvFile();
  for (const [key, value] of Object.entries(values)) {
    content = upsertEnvValue(content, key, value);
  }
  writeFileSync(envPath, content, "utf8");
}

async function run(command: string, args: string[], description: string): Promise<void> {
  console.log(\`\\n  -> \${description}\`);
  await new Promise<void>((resolvePromise, rejectPromise) => {
    const child = spawn(command, args, {
      cwd: rootDir,
      stdio: "inherit",
      shell: process.platform === "win32",
    });

    child.on("exit", (code) => {
      if (code === 0) {
        resolvePromise();
        return;
      }
      rejectPromise(new Error(\`\${description} failed\`));
    });
    child.on("error", rejectPromise);
  });
}

function onCancel(): never {
  throw new Error("Setup cancelled");
}

async function configureDatabase(): Promise<void> {
  const { choice } = await prompts({
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

  if (choice === "skip") return;

  if (choice === "local") {
    writeEnvValues({
      DATABASE_URL: "postgresql://hi:hi@localhost:5432/${answers.projectName}",
    });
    await run("docker", ["compose", "up", "-d", "postgres"], "starting local Postgres");
    await delay(5000);
  } else {
    const current = readEnvFile().match(/^DATABASE_URL=(.*)$/m)?.[1] ?? "";
    const response = await prompts({
      type: "text",
      name: "databaseUrl",
      message: "PostgreSQL connection string",
      initial: current,
      validate: (value: string) => value.trim().length > 0 || "DATABASE_URL is required",
    }, { onCancel });
    writeEnvValues({ DATABASE_URL: response.databaseUrl.trim() });
  }

  const migrations = await prompts({
    type: "confirm",
    name: "runMigrations",
    message: "Push the database schema now?",
    initial: true,
  }, { onCancel });
  if (migrations.runMigrations) {
    await run("pnpm", ["db:push"], "pushing database schema");
  }

  const seed = await prompts({
    type: "confirm",
    name: "seedStarterData",
    message: "Create starter site data now?",
    initial: true,
  }, { onCancel });
  if (seed.seedStarterData) {
    await run("pnpm", ["db:seed"], "creating starter site data");
  }
}

async function configureStorage(): Promise<void> {
  const { choice } = await prompts({
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

  if (choice === "skip") {
    writeEnvValues({
      S3_ENDPOINT: "",
      S3_REGION: "us-east-1",
      S3_BUCKET: "",
      S3_ACCESS_KEY: "",
      S3_SECRET_KEY: "",
      S3_FORCE_PATH_STYLE: "false",
    });
    return;
  }

  if (choice === "local") {
    writeEnvValues({
      S3_ENDPOINT: "http://localhost:8333",
      S3_REGION: "us-east-1",
      S3_BUCKET: "images",
      S3_ACCESS_KEY: "admin",
      S3_SECRET_KEY: "secret",
      S3_FORCE_PATH_STYLE: "true",
    });
    await run("docker", ["compose", "up", "-d", "seaweedfs"], "starting local SeaweedFS");
    return;
  }

  const currentEnv = readEnvFile();
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

  writeEnvValues({
    S3_ENDPOINT: response.endpoint.trim(),
    S3_REGION: response.region.trim(),
    S3_BUCKET: response.bucket.trim(),
    S3_ACCESS_KEY: response.accessKey.trim(),
    S3_SECRET_KEY: response.secretKey.trim(),
    S3_FORCE_PATH_STYLE: response.forcePathStyle ? "true" : "false",
  });
}

console.log("\\n  Project setup\\n");
await configureDatabase();
await configureStorage();
console.log("\\n  Setup complete. You can now run: pnpm dev\\n");
`;
}

export function seedScriptTs(answers: PromptAnswers): string {
  return `import "dotenv/config";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { closeDatabase, db, pages, sites } from "@vitrea/database";

const envPath = resolve(import.meta.dirname, "..", ".env");

function readEnvFile(): string {
  try {
    return readFileSync(envPath, "utf8");
  } catch {
    return "";
  }
}

function upsertEnvValue(content: string, key: string, value: string): string {
  const line = \`\${key}=\${value}\`;
  const pattern = new RegExp(\`^\${key}=.*$\`, "m");
  if (pattern.test(content)) {
    return content.replace(pattern, line);
  }
  const suffix = content.endsWith("\\n") || content.length === 0 ? "" : "\\n";
  return content + suffix + line + "\\n";
}

function writeWebsiteId(siteId: string): void {
  const current = readEnvFile();
  const next = upsertEnvValue(current, "WEBSITE_ID", siteId);
  writeFileSync(envPath, next, "utf8");
}

try {
  const [existingSite] = await db.select().from(sites).limit(1);

  const site = existingSite ?? (await db.insert(sites).values({
    id: nanoid(),
    slug: "${answers.projectName}",
    data: { name: "${answers.projectName}" },
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

  writeWebsiteId(site.id);

  console.log(\`Starter data ready. WEBSITE_ID=\${site.id}\`);
} finally {
  await closeDatabase();
}
`;
}
