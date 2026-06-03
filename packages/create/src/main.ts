import { resolve } from "@std/path";
import { ensureDir } from "@std/fs";
import { parseArgs } from "@std/cli";
import { Confirm } from "@cliffy/prompt";
import { parseFlags, promptInteractive } from "./prompts.ts";
import { scaffold } from "./scaffold.ts";

const bold = "\x1b[1m";
const cyan = "\x1b[36m";
const green = "\x1b[32m";
const yellow = "\x1b[33m";
const gray = "\x1b[90m";
const reset = "\x1b[0m";

const dirFlags = parseArgs(Deno.args, { string: ["dir"], boolean: ["preview"], default: { dir: ".", preview: false }, alias: { d: "dir", p: "preview" } });
const outDir = dirFlags.dir || ".";
const preview = dirFlags.preview;

const answers = parseFlags(Deno.args) ?? await promptInteractive();

const hasName = Deno.args.find((a) => a === "--name" || a === "-n");
if (!hasName) {
  console.log(`\n  ${bold}Hi!${reset} Let's set up your Editor project.\n`);
}

const targetDir = resolve(outDir, answers.projectName);

if (preview) {
  console.log(`\n  ${yellow}${bold}PREVIEW${reset} — no files will be written\n`);
  console.log(`  ${bold}Would create:${reset} ${cyan}${targetDir}/${reset}\n`);
  console.log(`  ${gray}my-site/`);
  console.log(`  ├── apps/`);
  console.log(`  │   ├── web/          ${answers.framework} website`);
  console.log(`  │   └── editor/       visual editor`);
  console.log(`  ├── packages/`);
  console.log(`  │   └── website/      your components & elements`);
  console.log(`  └── deno.json${reset}\n`);

  console.log(`  ${bold}Selected:${reset}`);
  console.log(`    Environment: ${answers.environment}`);
  console.log(`    Framework:   ${answers.framework}`);
  console.log(`    Storage:     ${answers.storage}`);
  if (answers.cloudProvider) console.log(`    Cloud:       ${answers.cloudProvider}`);
  console.log(`    Examples:    ${answers.includeExamples}`);
  console.log(`    Git:         ${answers.initGit}`);
  console.log(`    Run setup:   ${answers.startNow}\n`);

  const { listFiles } = await import("./scaffold.ts");
  const files = listFiles(answers);
  console.log(`  ${bold}Files:${reset}\n`);
  for (const f of files) {
    console.log(`    ${cyan}${f}${reset}`);
  }
  console.log("");
  Deno.exit(0);
}

await ensureDir(targetDir);
await scaffold(targetDir, answers);

console.log(`\n  ${green}${bold}Ready!${reset} Created at ${cyan}${targetDir}/${reset}`);

let ranLocalSetup = false;
if (answers.environment === "local" && Deno.stdin.isTerminal()) {
  const runSetupNow = answers.startNow || await Confirm.prompt({
    message: "Run local project setup now? Configure database and storage",
    default: true,
  });

  if (runSetupNow) {
    ranLocalSetup = true;
    console.log(`\n  ${bold}Running setup...${reset}\n`);
    await new Deno.Command("deno", {
      args: ["task", "setup"],
      cwd: targetDir,
      stdin: "inherit",
      stdout: "inherit",
      stderr: "inherit",
    }).output();
  }
}

if (!ranLocalSetup) {
  console.log(`\n  ${bold}Next steps:${reset}\n`);
  const s = (n: number, cmd: string, desc: string) =>
    `  ${gray}${n}.${reset}  ${cyan}${cmd}${reset}  ${gray}${desc}${reset}`;

  if (answers.environment === "local") {
    console.log(s(1, `cd ${answers.projectName}`, ""));
    console.log(s(2, "deno task setup", "choose database and storage"));
    console.log(s(3, "deno task dev", "start editor + website"));
  } else if (answers.environment === "vps") {
    console.log(s(1, "Edit .env", "set passwords and domain"));
    console.log(s(2, "docker compose up -d", "start all services"));
    console.log(s(3, "deno task db:push", "push schema"));
    console.log(s(4, "deno task db:seed", "seed sample data"));
  } else if (answers.cloudProvider === "vercel") {
    console.log(s(1, "Create a Neon DB", "https://neon.tech"));
    console.log(s(2, "vercel link", "connect to Vercel"));
    console.log(s(3, "vercel deploy", "deploy"));
  } else if (answers.cloudProvider === "railway") {
    console.log(s(1, "Push to GitHub", "connect at railway.app"));
    console.log(s(2, "Add PostgreSQL", "in Railway dashboard"));
    console.log(s(3, "Set env vars", "BETTER_AUTH_SECRET, etc."));
  } else if (answers.cloudProvider === "fly") {
    console.log(s(1, "fly launch", "create the app"));
    console.log(s(2, "fly postgres create", "add database"));
    console.log(s(3, "fly deploy", "deploy"));
  }
} else if (answers.environment === "local") {
  console.log(`\n  ${bold}Next step:${reset}\n`);
  console.log(`  ${gray}1.${reset}  ${cyan}cd ${answers.projectName} && deno task dev${reset}  ${gray}start editor + website${reset}`);
}
console.log("");
