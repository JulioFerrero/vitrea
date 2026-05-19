import { app as apiApp } from "./api/index";
import { join } from "node:path";
import { readFile, stat } from "node:fs/promises";

interface CreateServerOptions {
  port?: number;
  hostname?: string;
  distDir: string;
  tailwindCSS?: (classes: string[]) => Promise<string>;
  iframeBaseCSS?: () => Promise<string>;
  fontFileHandler?: (urlPathname: string) => Promise<Response | null>;
}

const mimeTypes: Record<string, string> = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".mjs": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
};

function getMimeType(path: string): string {
  const ext = path.lastIndexOf(".");
  return ext >= 0 ? mimeTypes[path.slice(ext)] ?? "application/octet-stream" : "application/octet-stream";
}

export function createServer(options: CreateServerOptions) {
  const { port = 5173, hostname = "0.0.0.0", distDir, tailwindCSS, iframeBaseCSS, fontFileHandler } = options;

  Deno.serve({ port, hostname }, async (req: Request) => {
    const url = new URL(req.url);

    if (url.pathname === "/api/tailwind" && req.method === "POST" && tailwindCSS) {
      const body = await req.json();
      const css = await tailwindCSS(body.classes ?? []);
      return new Response(css, { headers: { "content-type": "text/css" } });
    }

    if (url.pathname === "/api/iframe-base" && iframeBaseCSS) {
      const css = await iframeBaseCSS();
      return new Response(css, { headers: { "content-type": "text/css", "cache-control": "public, max-age=60" } });
    }

    if (url.pathname.startsWith("/fonts/") && fontFileHandler) {
      const response = await fontFileHandler(url.pathname);
      if (response) return response;
    }

    if (url.pathname.startsWith("/api/")) {
      const path = url.pathname.slice(4) || "/";
      const newUrl = new URL(path + url.search, url.origin);
      const newReq = new Request(newUrl, req);
      return apiApp.fetch(newReq);
    }

    let filePath = join(distDir, url.pathname === "/" ? "index.html" : url.pathname);
    try {
      await stat(filePath);
    } catch {
      filePath = join(distDir, "index.html");
    }

    try {
      const content = await readFile(filePath);
      return new Response(new Uint8Array(content), { headers: { "content-type": getMimeType(filePath) } });
    } catch {
      return new Response("Not Found", { status: 404 });
    }
  });
}
