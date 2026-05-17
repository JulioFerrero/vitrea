import { resolve } from "node:path";
import { createServer } from "@hi/editor/server";
import { tailwindCssResponse } from "@hi/website";

const cwd = Deno.cwd();
const distDir = resolve(cwd, "dist");

try {
  await Deno.stat(distDir);
} catch {
  console.error("Error: dist/ not found. Run `hi build` first.");
  Deno.exit(1);
}

console.log("Starting Hi Editor production server...");
createServer({
  distDir,
  tailwindCSS: (classes) => tailwindCssResponse(classes),
});
