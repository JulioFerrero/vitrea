const cssCache = new Map<string, string>();

const THEME_PATH = new URL("../theme.css", import.meta.url).pathname;

async function runTailwind(inputPath: string): Promise<string> {
  const cmd = new Deno.Command(Deno.execPath(), {
    args: ["run", "-A", "npm:@tailwindcss/cli", "--input", inputPath],
    stdout: "piped",
    stderr: "piped",
  });
  const output = await cmd.output();
  return new TextDecoder().decode(output.stdout);
}

async function generateCSS(classes: string[], genPath: string): Promise<string> {
  const key = classes.join(" ");
  const cached = cssCache.get(key);
  if (cached) return cached;

  const source = `@import "tailwindcss";\n@import "${THEME_PATH}";\n@source inline("${classes.join(" ")}");`;
  await Deno.writeTextFile(genPath, source);

  const css = await runTailwind(genPath);
  cssCache.set(key, css);
  return css;
}

const CLASS_REGEX = /class="([^"]+)"/g;

function extractClasses(html: string): string[] {
  const classes = new Set<string>();
  let match;
  while ((match = CLASS_REGEX.exec(html)) !== null) {
    for (const c of match[1].split(/\s+/)) {
      if (c) classes.add(c);
    }
  }
  return [...classes].sort();
}

export function tailwindCssResponse(classes: string[], genPath = "_tw_gen.css"): Promise<string> {
  const sorted = [...new Set(classes)].sort();
  if (sorted.length === 0) return Promise.resolve("");
  return generateCSS(sorted, genPath);
}

export function tailwindHtmlMiddleware(genPath = "_tw_gen.css") {
  return async (_ctx: unknown, next: () => Promise<Response>): Promise<Response> => {
    const response = await next();

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html")) return response;

    const html = await response.text();
    const classes = extractClasses(html);
    if (classes.length === 0) {
      return new Response(html, { headers: response.headers, status: response.status });
    }

    const css = await generateCSS(classes, genPath);
    const injected = html.replace("</head>", `<style>${css}</style>`);
    return new Response(injected, { headers: response.headers, status: response.status });
  };
}
