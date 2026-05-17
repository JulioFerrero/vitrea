import { app as apiApp } from "@hi/api";
import { tailwindCssResponse } from "@hi/website";
import { join } from "node:path";
import { readFile, exists } from "node:fs/promises";

const DIST = join(import.meta.dirname, "dist");

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

Deno.serve({ port: 5173, hostname: "0.0.0.0" }, async (req: Request) => {
  const url = new URL(req.url);

  if (url.pathname === "/api/tailwind" && req.method === "POST") {
    const body = await req.json();
    const css = await tailwindCssResponse(body.classes ?? []);
    return new Response(css, { headers: { "content-type": "text/css" } });
  }

  if (url.pathname.startsWith("/api/")) {
    const path = url.pathname.slice(4) || "/";
    const newUrl = new URL(path + url.search, url.origin);
    const newReq = new Request(newUrl, req);
    return apiApp.fetch(newReq);
  }

  let filePath = join(DIST, url.pathname === "/" ? "index.html" : url.pathname);
  if (!(await exists(filePath))) {
    filePath = join(DIST, "index.html");
  }

  try {
    const content = await readFile(filePath);
    return new Response(content, { headers: { "content-type": getMimeType(filePath) } });
  } catch {
    return new Response("Not Found", { status: 404 });
  }
});
