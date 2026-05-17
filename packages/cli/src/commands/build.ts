import { resolve } from "node:path";

const cwd = Deno.cwd();
const root = resolve(cwd, "..", "..");

const vitePath = resolve(root, "node_modules/.deno/vite@7.3.2/node_modules/vite/bin/vite.js");

const command = new Deno.Command(Deno.execPath(), {
  args: ["run", "-A", "--env", vitePath, "build"],
  cwd,
  env: {
    ...Deno.env.toObject(),
    HI_ROOT: root,
  },
  stdout: "inherit",
  stderr: "inherit",
  stdin: "inherit",
});

const process = command.spawn();
const status = await process.status;
Deno.exit(status.code);
