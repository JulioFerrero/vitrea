import { resolve } from "node:path";

const cwd = Deno.cwd();
const root = resolve(cwd, "..", "..");

const configPath = resolve(cwd, "hi.config.ts");

try {
  await Deno.stat(configPath);
} catch {
  console.error("Error: hi.config.ts not found in current directory");
  Deno.exit(1);
}

const vitePath = resolve(root, "node_modules/.deno/vite@7.3.2/node_modules/vite/bin/vite.js");

const command = new Deno.Command(Deno.execPath(), {
  args: ["run", "-A", "--env", vitePath],
  cwd,
  env: {
    ...Deno.env.toObject(),
    HI_CONFIG_PATH: configPath,
    HI_ROOT: root,
  },
  stdout: "inherit",
  stderr: "inherit",
  stdin: "inherit",
});

const process = command.spawn();
const status = await process.status;
Deno.exit(status.code);
