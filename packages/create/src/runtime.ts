import { spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { basename } from "node:path";
import process from "node:process";
import type { PromptAnswers } from "./prompts";

export class CommandError extends Error {
  output: string;

  constructor(command: string, args: string[], output: string, exitCode: number | null) {
    const exitCodeSuffix = exitCode === null ? "" : ` with exit code ${exitCode}`;
    super(`${command} ${args.join(" ")} failed${exitCodeSuffix}`);
    this.name = "CommandError";
    this.output = output;
  }
}

export function readCliVersion(): string {
  try {
    const packageJson = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8")) as { version?: string };
    return packageJson.version ?? "unknown";
  } catch {
    return "unknown";
  }
}

export function readEnvFile(envPath: string): string {
  try {
    return readFileSync(envPath, "utf8");
  } catch {
    return "";
  }
}

export function readEnvValue(envContent: string, key: string): string {
  return new RegExp(`^${key}=(.*)$`, "m").exec(envContent)?.[1] ?? "";
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

export function writeEnvValues(envPath: string, values: Record<string, string>): void {
  let content = readEnvFile(envPath);
  for (const [key, value] of Object.entries(values)) {
    content = upsertEnvValue(content, key, value);
  }

  writeFileSync(envPath, content, "utf8");
}

export function normalizeName(value: string): string {
  const normalized = value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return normalized || "vitrea-site";
}

export function isValidPort(value: string): boolean {
  const port = Number.parseInt(value, 10);
  return Number.isInteger(port) && port >= 1 && port <= 65535;
}

export function parseDatabasePort(envContent: string): string | undefined {
  const explicitPort = /^POSTGRES_PORT=(.*)$/m.exec(envContent)?.[1]?.trim();
  if (explicitPort && isValidPort(explicitPort)) {
    return explicitPort;
  }

  const databaseUrl = /^DATABASE_URL=(.*)$/m.exec(envContent)?.[1]?.trim();
  const databasePort = databaseUrl ? /^[a-z]+:\/\/[^@]+@[^:/]+:(\d+)\//i.exec(databaseUrl)?.[1] : undefined;
  if (databasePort && isValidPort(databasePort)) {
    return databasePort;
  }

  return undefined;
}

export function getLocalDatabaseUrl(databaseName: string, port: string): string {
  return `postgresql://hi:hi@localhost:${port}/${databaseName}`;
}

export function isDockerPortConflict(error: unknown, port: string): boolean {
  if (!(error instanceof CommandError)) {
    return false;
  }

  const lowerCaseOutput = error.output.toLowerCase();
  const hasPortReference = error.output.includes(`:${port}`);
  const isBindFailure = lowerCaseOutput.includes("port is already allocated")
    || lowerCaseOutput.includes("address already in use")
    || lowerCaseOutput.includes("ports are not available");

  return hasPortReference && isBindFailure;
}

export function createId(): string {
  return randomBytes(16).toString("base64url").slice(0, 21);
}

export function formatLines(lines: string[]): string {
  return lines.join("\n");
}

export function formatNextSteps(targetDir: string, answers: PromptAnswers): string {
  const cdTarget = basename(targetDir) || answers.projectName;

  if (answers.environment === "local") {
    return formatLines([
      `1. cd ${cdTarget}`,
      "2. pnpm install",
      "3. pnpm run vitrea:setup",
      "4. pnpm dev",
    ]);
  }

  if (answers.environment === "vps") {
    return formatLines([
      "1. pnpm install",
      "2. Edit .env",
      "3. docker compose up -d",
      "4. pnpm db:push",
      "5. pnpm db:seed",
    ]);
  }

  if (answers.cloudProvider === "vercel") {
    return formatLines([
      "1. pnpm install",
      "2. Create a Neon DB",
      "3. vercel link",
      "4. vercel deploy",
    ]);
  }

  if (answers.cloudProvider === "railway") {
    return formatLines([
      "1. pnpm install",
      "2. Push to GitHub",
      "3. Add PostgreSQL in Railway",
      "4. Set env vars",
    ]);
  }

  return formatLines([
    "1. pnpm install",
    "2. fly launch",
    "3. fly postgres create",
    "4. fly deploy",
  ]);
}

export async function runCommand(
  command: string,
  args: string[],
  cwd: string,
  options?: { interactive?: boolean; streamOutput?: boolean },
): Promise<void> {
  await new Promise<void>((resolvePromise, rejectPromise) => {
    const child = spawn(command, args, {
      cwd,
      stdio: options?.interactive ? "inherit" : ["inherit", "pipe", "pipe"],
      shell: process.platform === "win32",
    });
    let output = "";

    if (!options?.interactive && options?.streamOutput) {
      child.stdout?.on("data", (chunk) => {
        output += chunk.toString();
        process.stdout.write(chunk);
      });

      child.stderr?.on("data", (chunk) => {
        output += chunk.toString();
        process.stderr.write(chunk);
      });
    } else if (!options?.interactive) {
      child.stdout?.on("data", (chunk) => {
        output += chunk.toString();
      });

      child.stderr?.on("data", (chunk) => {
        output += chunk.toString();
      });
    }

    child.on("exit", (code) => {
      if (code === 0) {
        resolvePromise();
        return;
      }

      rejectPromise(new CommandError(command, args, output, code));
    });

    child.on("error", rejectPromise);
  });
}
