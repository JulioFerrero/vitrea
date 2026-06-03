import type { PromptAnswers } from "../prompts.ts";

export function drizzleConfigTs(): string {
  return `import { defineConfig } from "drizzle-kit";

const connectionString = Deno.env.get("DATABASE_URL");

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
  return `export * from "jsr:@hi/database@^0.1.0/schema";
`;
}

export function setupScriptTs(answers: PromptAnswers): string {
  return `import { Confirm, Input, Select } from "@cliffy/prompt";
import { fromFileUrl } from "@std/path";

type DatabaseChoice = "local" | "existing" | "skip";
type StorageChoice = "local" | "existing" | "skip";

const rootDir = fromFileUrl(new URL("../", import.meta.url));
const envPath = fromFileUrl(new URL("../.env", import.meta.url));

function readEnvFile(): string {
  try {
    return Deno.readTextFileSync(envPath);
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
  Deno.writeTextFileSync(envPath, content);
}

async function run(command: string, args: string[], description: string): Promise<void> {
  console.log(\`\\n  -> \${description}\`);
  const result = await new Deno.Command(command, {
    args,
    cwd: rootDir,
    stdin: "inherit",
    stdout: "inherit",
    stderr: "inherit",
  }).output();
  if (!result.success) {
    throw new Error(\`\${description} failed\`);
  }
}

async function configureDatabase(): Promise<void> {
  const choice = await Select.prompt<DatabaseChoice>({
    message: "Database setup",
    options: [
      { name: "Use local Docker Postgres", value: "local" },
      { name: "Use an existing PostgreSQL database", value: "existing" },
      { name: "Skip for now", value: "skip" },
    ],
  });

  if (choice === "skip") return;

  if (choice === "local") {
    writeEnvValues({
      DATABASE_URL: "postgresql://hi:hi@localhost:5432/${answers.projectName}",
    });
    await run("docker", ["compose", "up", "-d", "postgres"], "starting local Postgres");
    await new Promise((resolve) => setTimeout(resolve, 5000));
  } else {
    const current = readEnvFile().match(/^DATABASE_URL=(.*)$/m)?.[1] ?? "";
    const databaseUrl = await Input.prompt({
      message: "PostgreSQL connection string",
      default: current,
      validate: (value) => value.trim().length > 0 || "DATABASE_URL is required",
    });
    writeEnvValues({ DATABASE_URL: databaseUrl.trim() });
  }

  const runMigrations = await Confirm.prompt({
    message: "Push the database schema now?",
    default: true,
  });
  if (runMigrations) {
    await run("deno", ["task", "db:push"], "pushing database schema");
  }

  const seedStarterData = await Confirm.prompt({
    message: "Create starter site data now?",
    default: true,
  });
  if (seedStarterData) {
    await run("deno", ["task", "db:seed"], "creating starter site data");
  }
}

async function configureStorage(): Promise<void> {
  const choice = await Select.prompt<StorageChoice>({
    message: "Asset storage setup",
    options: [
      { name: "Run local S3 with SeaweedFS", value: "local" },
      { name: "Use an existing S3-compatible storage", value: "existing" },
      { name: "Skip for now", value: "skip" },
    ],
  });

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

  const endpoint = await Input.prompt({
    message: "S3 endpoint (leave blank for AWS S3)",
    default: readEnvFile().match(/^S3_ENDPOINT=(.*)$/m)?.[1] ?? "",
  });
  const region = await Input.prompt({
    message: "S3 region",
    default: readEnvFile().match(/^S3_REGION=(.*)$/m)?.[1] ?? "us-east-1",
  });
  const bucket = await Input.prompt({
    message: "S3 bucket",
    default: readEnvFile().match(/^S3_BUCKET=(.*)$/m)?.[1] ?? "",
    validate: (value) => value.trim().length > 0 || "S3 bucket is required",
  });
  const accessKey = await Input.prompt({
    message: "S3 access key",
    default: readEnvFile().match(/^S3_ACCESS_KEY=(.*)$/m)?.[1] ?? "",
  });
  const secretKey = await Input.prompt({
    message: "S3 secret key",
    default: readEnvFile().match(/^S3_SECRET_KEY=(.*)$/m)?.[1] ?? "",
  });
  const forcePathStyle = await Confirm.prompt({
    message: "Use path-style S3 URLs?",
    default: (readEnvFile().match(/^S3_FORCE_PATH_STYLE=(.*)$/m)?.[1] ?? "false") === "true",
  });

  writeEnvValues({
    S3_ENDPOINT: endpoint.trim(),
    S3_REGION: region.trim(),
    S3_BUCKET: bucket.trim(),
    S3_ACCESS_KEY: accessKey.trim(),
    S3_SECRET_KEY: secretKey.trim(),
    S3_FORCE_PATH_STYLE: forcePathStyle ? "true" : "false",
  });
}

console.log("\\n  Project setup\\n");
await configureDatabase();
await configureStorage();
console.log("\\n  Setup complete. You can now run: deno task dev\\n");
`;
}

export function seedScriptTs(answers: PromptAnswers): string {
  return `import { fromFileUrl } from "@std/path";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db, pages, sites } from "@hi/database";

const envPath = fromFileUrl(new URL("../.env", import.meta.url));

function readEnvFile(): string {
  try {
    return Deno.readTextFileSync(envPath);
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
  Deno.writeTextFileSync(envPath, next);
}

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
`;
}
