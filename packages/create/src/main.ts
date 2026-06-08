#!/usr/bin/env node

import { mkdir } from "node:fs/promises";
import { basename, resolve } from "node:path";
import process from "node:process";
import { setTimeout as delay } from "node:timers/promises";
import { cac } from "cac";
import { config as loadDotenv } from "dotenv";
import { eq } from "drizzle-orm";
import { Listr } from "listr2";
import {
  normalizeCreateOptions,
  promptConfirm,
  promptInteractive,
  promptSelect,
  promptText,
  showIntro,
  showNote,
  showOutro,
  showSummary,
  type CreateFlagOptions,
} from "./prompts";
import {
  createId,
  formatLines,
  formatNextSteps,
  getLocalDatabaseUrl,
  isDockerPortConflict,
  isValidPort,
  normalizeName,
  parseDatabasePort,
  readCliVersion,
  readEnvFile,
  readEnvValue,
  runCommand,
  writeEnvValues,
} from "./runtime";
import { listFiles, scaffold } from "./scaffold";

const CLI_VERSION = readCliVersion();

type SetupCommandOptions = {
  cwd?: string;
  siteName?: string;
  dbPort?: string;
};

type CreateCommandOptions = CreateFlagOptions & {
  dir?: string;
  preview?: boolean;
};

type TaskDefinition = {
  title: string;
  task: () => Promise<void>;
};

type SetupDatabaseChoice = "local" | "existing" | "skip";
type SetupStorageChoice = "local" | "existing" | "skip";

type DatabasePlan = {
  choice: SetupDatabaseChoice;
  tasks: TaskDefinition[];
  selectedPort?: string;
};

type StoragePlan = {
  choice: SetupStorageChoice;
  tasks: TaskDefinition[];
};

async function startLocalDatabase({
  cwd,
  envPath,
  databaseName,
  requestedPort,
}: {
  cwd: string;
  envPath: string;
  databaseName: string;
  requestedPort?: string;
}): Promise<string> {
  const currentPort = parseDatabasePort(readEnvFile(envPath));
  let databasePort = requestedPort ?? currentPort ?? "5432";

  while (true) {
    writeEnvValues(envPath, {
      POSTGRES_PORT: databasePort,
      DATABASE_URL: getLocalDatabaseUrl(databaseName, databasePort),
    });

    try {
      await runCommand("docker", ["compose", "up", "-d", "postgres"], cwd);
      await delay(5000);
      return databasePort;
    } catch (error) {
      if (!isDockerPortConflict(error, databasePort)) {
        throw error;
      }

      showNote("Port conflict", `Port ${databasePort} is already in use.`);
      databasePort = await promptText("Host port for local Postgres", {
        initialValue: databasePort === "5432" ? "5433" : databasePort,
        validate: (value) => value && isValidPort(value.trim()) ? undefined : "Enter a port between 1 and 65535",
      });
    }
  }
}

async function collectDatabasePlan({
  cwd,
  envPath,
  siteName,
  dbPort,
}: {
  cwd: string;
  envPath: string;
  siteName: string;
  dbPort?: string;
}): Promise<DatabasePlan> {
  const databaseName = normalizeName(siteName);
  const choice = await promptSelect<SetupDatabaseChoice>("Database setup", [
    { value: "local", label: "Use local Docker Postgres", hint: "Runs PostgreSQL in Docker on this machine." },
    { value: "existing", label: "Use an existing PostgreSQL database", hint: "Provide your own connection string." },
    { value: "skip", label: "Skip for now", hint: "Configure the database later." },
  ]);

  const tasks: TaskDefinition[] = [];
  let selectedPort = dbPort;

  if (choice === "local") {
    tasks.push({
      title: "Start local PostgreSQL",
      task: async () => {
        selectedPort = await startLocalDatabase({
          cwd,
          envPath,
          databaseName,
          requestedPort: dbPort,
        });
      },
    });

    if (await promptConfirm("Push the database schema now?", true)) {
      tasks.push({
        title: "Push database schema",
        task: async () => {
          await runCommand("pnpm", ["db:push"], cwd);
        },
      });
    }

    if (await promptConfirm("Create starter site data now?", true)) {
      tasks.push({
        title: "Seed starter content",
        task: async () => {
          await runCommand("pnpm", ["db:seed"], cwd);
        },
      });
    }
  }

  if (choice === "existing") {
    const currentDatabaseUrl = readEnvValue(readEnvFile(envPath), "DATABASE_URL");
    const databaseUrl = await promptText("PostgreSQL connection string", {
      initialValue: currentDatabaseUrl,
      validate: (value) => value && value.trim().length > 0 ? undefined : "DATABASE_URL is required",
    });

    tasks.push({
      title: "Save database connection",
      task: async () => {
        writeEnvValues(envPath, { DATABASE_URL: databaseUrl.trim() });
      },
    });

    if (await promptConfirm("Push the database schema now?", true)) {
      tasks.push({
        title: "Push database schema",
        task: async () => {
          await runCommand("pnpm", ["db:push"], cwd);
        },
      });
    }

    if (await promptConfirm("Create starter site data now?", true)) {
      tasks.push({
        title: "Seed starter content",
        task: async () => {
          await runCommand("pnpm", ["db:seed"], cwd);
        },
      });
    }
  }

  return { choice, tasks, selectedPort };
}

async function collectStoragePlan({
  cwd,
  envPath,
}: {
  cwd: string;
  envPath: string;
}): Promise<StoragePlan> {
  const choice = await promptSelect<SetupStorageChoice>("Asset storage setup", [
    { value: "local", label: "Run local S3 with SeaweedFS", hint: "Good for local development." },
    { value: "existing", label: "Use an existing S3-compatible storage", hint: "Use AWS S3 or another compatible provider." },
    { value: "skip", label: "Skip for now", hint: "Configure storage later." },
  ]);

  if (choice === "skip") {
    return {
      choice,
      tasks: [{
        title: "Clear storage configuration",
        task: async () => {
          writeEnvValues(envPath, {
            S3_ENDPOINT: "",
            S3_REGION: "us-east-1",
            S3_BUCKET: "",
            S3_ACCESS_KEY: "",
            S3_SECRET_KEY: "",
            S3_FORCE_PATH_STYLE: "false",
          });
        },
      }],
    };
  }

  if (choice === "local") {
    return {
      choice,
      tasks: [
        {
          title: "Configure local S3",
          task: async () => {
            writeEnvValues(envPath, {
              S3_ENDPOINT: "http://localhost:8333",
              S3_REGION: "us-east-1",
              S3_BUCKET: "images",
              S3_ACCESS_KEY: "admin",
              S3_SECRET_KEY: "secret",
              S3_FORCE_PATH_STYLE: "true",
            });
          },
        },
        {
          title: "Start SeaweedFS",
          task: async () => {
            await runCommand("docker", ["compose", "up", "-d", "seaweedfs"], cwd);
          },
        },
      ],
    };
  }

  const currentEnv = readEnvFile(envPath);
  const endpoint = await promptText("S3 endpoint (leave blank for AWS S3)", {
    initialValue: readEnvValue(currentEnv, "S3_ENDPOINT"),
  });
  const region = await promptText("S3 region", {
    initialValue: readEnvValue(currentEnv, "S3_REGION") || "us-east-1",
    defaultValue: "us-east-1",
  });
  const bucket = await promptText("S3 bucket", {
    initialValue: readEnvValue(currentEnv, "S3_BUCKET"),
    validate: (value) => value && value.trim().length > 0 ? undefined : "S3 bucket is required",
  });
  const accessKey = await promptText("S3 access key", {
    initialValue: readEnvValue(currentEnv, "S3_ACCESS_KEY"),
  });
  const secretKey = await promptText("S3 secret key", {
    initialValue: readEnvValue(currentEnv, "S3_SECRET_KEY"),
  });
  const forcePathStyle = await promptConfirm(
    "Use path-style S3 URLs?",
    readEnvValue(currentEnv, "S3_FORCE_PATH_STYLE") === "true",
  );

  return {
    choice,
    tasks: [{
      title: "Save storage configuration",
      task: async () => {
        writeEnvValues(envPath, {
          S3_ENDPOINT: endpoint.trim(),
          S3_REGION: region.trim(),
          S3_BUCKET: bucket.trim(),
          S3_ACCESS_KEY: accessKey.trim(),
          S3_SECRET_KEY: secretKey.trim(),
          S3_FORCE_PATH_STYLE: forcePathStyle ? "true" : "false",
        });
      },
    }],
  };
}

async function runTaskList(tasks: TaskDefinition[]): Promise<void> {
  if (tasks.length === 0) {
    return;
  }

  await new Listr(tasks, {
    concurrent: false,
    exitOnError: true,
  }).run();
}

function showSetupCompletion(siteName: string, envPath: string, databaseChoice: SetupDatabaseChoice, storageChoice: SetupStorageChoice, selectedPort?: string): void {
  showNote("Saved configuration", formatLines([
    `Project:  ${siteName}`,
    `Env file: ${envPath}`,
    `Database: ${databaseChoice}`,
    `DB port:  ${selectedPort ?? "n/a"}`,
    `Storage:  ${storageChoice}`,
  ]));
  showOutro(`Setup complete for ${siteName}.`);
}

async function runSetup({ cwd, siteName, dbPort }: { cwd: string; siteName: string; dbPort?: string }): Promise<void> {
  const envPath = resolve(cwd, ".env");
  showIntro(CLI_VERSION, "Project setup", `Configure database and storage for ${siteName}`);

  const databasePlan = await collectDatabasePlan({ cwd, envPath, siteName, dbPort });
  const storagePlan = await collectStoragePlan({ cwd, envPath });

  showSummary("Setup summary", [
    ["Project", siteName],
    ["Database", databasePlan.choice],
    ["DB port", databasePlan.selectedPort],
    ["Storage", storagePlan.choice],
  ]);

  await runTaskList([...databasePlan.tasks, ...storagePlan.tasks]);
  showSetupCompletion(siteName, envPath, databasePlan.choice, storagePlan.choice, databasePlan.selectedPort);
}

async function runSeed({ cwd, siteName }: { cwd: string; siteName: string }): Promise<void> {
  const envPath = resolve(cwd, ".env");
  loadDotenv({ path: envPath });
  showIntro(CLI_VERSION, "Seed starter content", `Populate the initial site data for ${siteName}`);

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

    showOutro(`Starter data ready. WEBSITE_ID=${String(site.id)}`);
  } finally {
    await closeDatabase();
  }
}

async function runScaffold(options: CreateCommandOptions, positionalDir?: string): Promise<void> {
  showIntro(CLI_VERSION, "Create project", "Scaffold a Vitrea editor + website workspace");

  const answers = normalizeCreateOptions(options) ?? await promptInteractive();
  showSummary("Configuration", [
    ["Project", answers.projectName],
    ["Environment", answers.environment],
    ["Framework", answers.framework],
    ["Storage", answers.storage],
    ["Cloud", answers.cloudProvider],
    ["Examples", answers.includeExamples],
    ["Git", answers.initGit],
    ["Run setup", answers.startNow],
  ]);

  const explicitTarget = options.dir ?? positionalDir;
  const targetDir = explicitTarget
    ? resolve(explicitTarget)
    : resolve(".", answers.projectName);

  if (options.preview) {
    showNote("Preview", formatLines([
      `Would create: ${targetDir}/`,
      "",
      ...listFiles(answers),
    ]));
    showOutro("Preview complete.");
    return;
  }

  const shouldRunLocalSetup = answers.environment === "local"
    ? (answers.startNow || await promptConfirm("Install dependencies and run local setup now?", true))
    : false;

  const tasks: TaskDefinition[] = [
    {
      title: "Create project files",
      task: async () => {
        await mkdir(targetDir, { recursive: true });
        await scaffold(targetDir, answers);
      },
    },
  ];

  if (shouldRunLocalSetup) {
    tasks.push(
      {
        title: "Install dependencies",
        task: async () => {
          await runCommand("pnpm", ["install"], targetDir);
        },
      },
      {
        title: "Run project setup",
        task: async () => {
          await runCommand("pnpm", ["run", "vitrea:setup"], targetDir);
        },
      },
    );
  }

  await runTaskList(tasks);

  if (shouldRunLocalSetup) {
    showNote("Next step", `cd ${basename(targetDir) || answers.projectName} && pnpm dev`);
  } else {
    showNote("Next steps", formatNextSteps(targetDir, answers));
  }

  showOutro(`Created ${answers.projectName} at ${targetDir}.`);
}

const cli = cac("vitrea");
cli.version(CLI_VERSION);
cli.help();

cli
  .command("[dir]", "Create a Vitrea project")
  .option("-d, --dir [dir]", "Target directory")
  .option("-n, --name <name>", "Project name")
  .option("--env <env>", "Environment: local, vps, cloud")
  .option("--framework <framework>", "Website framework")
  .option("--storage <storage>", "Storage: seaweedfs, s3, skip")
  .option("--cloud <cloud>", "Cloud provider: vercel, railway, fly")
  .option("--no-examples", "Do not include example components")
  .option("--no-git", "Do not initialize git")
  .option("--start", "Install dependencies and run local setup")
  .option("-p, --preview", "Preview the generated file tree")
  .action(async (dir: string | undefined, options: CreateCommandOptions) => {
    await runScaffold(options, dir);
  });

cli
  .command("setup", "Configure database and storage for a project")
  .option("--cwd <cwd>", "Project directory")
  .option("--site-name <siteName>", "Site name")
  .option("--db-port <dbPort>", "Host port for local Postgres")
  .action(async (options: SetupCommandOptions) => {
    const cwd = resolve(options.cwd ?? process.cwd());
    const siteName = options.siteName ?? basename(cwd);
    const dbPort = options.dbPort;

    if (dbPort && !isValidPort(dbPort)) {
      throw new Error("--db-port must be a number between 1 and 65535");
    }

    await runSetup({ cwd, siteName, dbPort });
  });

cli
  .command("seed", "Create starter content for a project")
  .option("--cwd <cwd>", "Project directory")
  .option("--site-name <siteName>", "Site name")
  .action(async (options: SetupCommandOptions) => {
    const cwd = resolve(options.cwd ?? process.cwd());
    const siteName = options.siteName ?? basename(cwd);
    await runSeed({ cwd, siteName });
  });

try {
  cli.parse(process.argv, { run: false });
  await cli.runMatchedCommand();
} catch (error) {
  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error(error);
  }
  process.exit(1);
}
