import { createServer } from "@hi/editor/server";
import { tailwindCssResponse } from "@hi/website";
import { join } from "node:path";

createServer({
  distDir: join(import.meta.dirname, "dist"),
  tailwindCSS: (classes) => tailwindCssResponse(classes),
});
