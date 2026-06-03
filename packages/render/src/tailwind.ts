import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import process from "node:process";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";

const cssCache = new Map<string, string>();
const require = createRequire(import.meta.url);

async function runTailwind(inputPath: string): Promise<string> {
  const packageJsonPath = require.resolve("@tailwindcss/cli/package.json");
  const packageJson = JSON.parse(await readFile(packageJsonPath, "utf8")) as {
    bin?: string | Record<string, string>;
  };
  const binRelativePath = typeof packageJson.bin === "string"
    ? packageJson.bin
    : packageJson.bin?.tailwindcss;

  if (!binRelativePath) {
    throw new Error("Could not resolve @tailwindcss/cli binary");
  }

  const binPath = resolve(dirname(packageJsonPath), binRelativePath);

  return new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(process.execPath, [binPath, "--input", inputPath], {
      stdio: ["ignore", "pipe", "pipe"],
    });

    const stdout: Buffer[] = [];
    const stderr: Buffer[] = [];

    child.stdout.on("data", (chunk: Buffer) => stdout.push(chunk));
    child.stderr.on("data", (chunk: Buffer) => stderr.push(chunk));
    child.on("error", rejectPromise);
    child.on("close", (code) => {
      if (code === 0) {
        resolvePromise(Buffer.concat(stdout).toString("utf8"));
        return;
      }

      rejectPromise(
        new Error(Buffer.concat(stderr).toString("utf8") || `Tailwind CLI exited with code ${code}`),
      );
    });
  });
}

async function generateCSS(classes: string[], genPath: string, themePath: string): Promise<string> {
  const key = themePath + "|" + classes.join(" ");
  const cached = cssCache.get(key);
  if (cached) return cached;

  const source = `@import "tailwindcss";\n@import "${themePath}";\n@source inline("${classes.join(" ")}");`;
  await writeFile(genPath, source, "utf8");

  const css = await runTailwind(genPath);
  cssCache.set(key, css);
  return css;
}

const CLASS_REGEX = /class="([^"]+)"/g;

function extractClasses(html: string): string[] {
  const classes = new Set<string>();
  let match;
  while ((match = CLASS_REGEX.exec(html)) !== null) {
      for (const c of match[1]!.split(/\s+/)) {
      if (c) classes.add(c);
    }
  }
  return [...classes].sort();
}

/** Tailwind CSS generator interface for server-side style generation. */
export interface TailwindGenerator {
  generateCSS(classes: string[], genPath?: string): Promise<string>;
  htmlMiddleware(): (_ctx: unknown, next: () => Promise<Response>) => Promise<Response>;
}

/** Create a Tailwind CSS generator with caching and optional HTML middleware. */
export function createTailwindGenerator(options: { themePath: string; stylesPath?: string }): TailwindGenerator {
  const { themePath, stylesPath } = options;
  const activeThemePath = stylesPath ?? themePath;

  return {
    generateCSS(classes: string[], genPath = "_tw_gen.css"): Promise<string> {
      const sorted = [...new Set(classes)].sort();
      if (sorted.length === 0) return Promise.resolve("");
      return generateCSS(sorted, genPath, themePath);
    },

    htmlMiddleware() {
      return async (_ctx: unknown, next: () => Promise<Response>): Promise<Response> => {
        const response = await next();

        const contentType = response.headers.get("content-type") ?? "";
        if (!contentType.includes("text/html")) return response;

        const html = await response.text();
        const classes = extractClasses(html);
        if (classes.length === 0) {
          return new Response(html, { headers: response.headers, status: response.status });
        }

        const css = await generateCSS(classes, "_tw_gen.css", activeThemePath);
        const injected = html.replace("</head>", `<style>${css}</style>`);
        return new Response(injected, { headers: response.headers, status: response.status });
      };
    },
  };
}
