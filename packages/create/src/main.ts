#!/usr/bin/env node

import { mkdir } from "node:fs/promises";
import { parseArgs } from "node:util";
import { resolve } from "node:path";
import { spawn } from "node:child_process";
import process from "node:process";
import pc from "picocolors";
import prompts from "prompts";
import { parseFlags, promptInteractive } from "./prompts";
import { listFiles, scaffold } from "./scaffold";

function onCancel(): never {
  throw new Error("Prompt cancelled");
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

const { values } = parseArgs({
  args: process.argv.slice(2),
  options: {
    dir: { type: "string", short: "d", default: "." },
    preview: { type: "boolean", short: "p", default: false },
  },
  allowPositionals: false,
});

const answers = parseFlags(process.argv.slice(2)) ?? await promptInteractive();

const hasName = process.argv.slice(2).some((arg) => arg === "--name" || arg === "-n");
if (!hasName) {
  console.log(`\n  ${pc.bold("Vitrea")} Let's set up your Editor project.\n`);
}

const targetDir = resolve(values.dir ?? ".", answers.projectName);

if (values.preview) {
  console.log(`\n  ${pc.yellow(pc.bold("PREVIEW"))} - no files will be written\n`);
  console.log(`  ${pc.bold("Would create:")} ${pc.cyan(`${targetDir}/`)}\n`);
  console.log(`  ${pc.gray(`${answers.projectName}/`)}`);
  console.log(`  ${pc.gray("  |- apps/")}`);
  console.log(`  ${pc.gray(`  |  |- web/          ${answers.framework} website`)}`);
  console.log(`  ${pc.gray("  |  |- editor/       visual editor")}`);
  console.log(`  ${pc.gray("  |- packages/")}`);
  console.log(`  ${pc.gray("  |  |- website/      your components and elements")}`);
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
  const step = (index: number, command: string, description: string) =>
    `  ${pc.gray(`${index}.`)}  ${pc.cyan(command)}${description ? `  ${pc.gray(description)}` : ""}`;

  if (answers.environment === "local") {
    console.log(step(1, `cd ${answers.projectName}`, ""));
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
  console.log(`  ${pc.gray("1.")}  ${pc.cyan(`cd ${answers.projectName} && pnpm dev`)}  ${pc.gray("start editor and website")}`);
}
console.log("");
