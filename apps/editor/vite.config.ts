import { defineConfig, type Plugin } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "node:path";
import { denoWorkspacePlugin } from "./vite-plugin-deno.ts";
import { Buffer } from "node:buffer";
import { WebSocketServer } from "ws";

type ClientInfo = { userId: string; name: string; color: string; siteId: string; pageId: string };
const wsRooms = new Map<WebSocket, ClientInfo>();

function wsRoomKey(siteId: string, pageId: string) { return `${siteId}:${pageId}`; }

function handleWsJoin(wss: InstanceType<typeof WebSocketServer>, ws: WebSocket, msg: Record<string, unknown>) {
  const { userId, name, color, siteId, pageId } = msg as Record<string, string>;
  if (!userId || !siteId || !pageId) return;
  const old = wsRooms.get(ws);
  if (old && old.userId === userId && wsRoomKey(old.siteId, old.pageId) === wsRoomKey(siteId, pageId)) return;
  wsRooms.delete(ws);
  wsRooms.set(ws, { userId, name, color, siteId, pageId });
  const key = wsRoomKey(siteId, pageId);
  for (const [other, info] of wsRooms) {
    if (other !== ws && wsRoomKey(info.siteId, info.pageId) === key) {
      other.send(JSON.stringify({ type: "join", userId, name, color }));
      ws.send(JSON.stringify({ type: "join", userId: info.userId, name: info.name, color: info.color }));
    }
  }
}

function handleWsCursor(wss: InstanceType<typeof WebSocketServer>, ws: WebSocket, msg: Record<string, unknown>) {
  const info = wsRooms.get(ws);
  if (!info) return;
  const key = wsRoomKey(info.siteId, info.pageId);
  const data = JSON.stringify({ type: "cursor", userId: info.userId, x: msg.x, y: msg.y });
  for (const [other, otherInfo] of wsRooms) {
    if (other !== ws && other.readyState === 1 && wsRoomKey(otherInfo.siteId, otherInfo.pageId) === key) {
      other.send(data);
    }
  }
}

function handleWsUpdate(wss: InstanceType<typeof WebSocketServer>, ws: WebSocket, msg: Record<string, unknown>) {
  const info = wsRooms.get(ws);
  if (!info) return;
  const key = wsRoomKey(info.siteId, info.pageId);
  const elementId = msg.elementId as string;
  const patch = msg.patch as Record<string, unknown>;
  if (!elementId || !patch) return;
  const data = JSON.stringify({ type: "update", elementId, patch });
  for (const [other, otherInfo] of wsRooms) {
    if (other !== ws && other.readyState === 1 && wsRoomKey(otherInfo.siteId, otherInfo.pageId) === key) {
      other.send(data);
    }
  }
}

function handleWsLeave(wss: InstanceType<typeof WebSocketServer>, ws: WebSocket) {
  const info = wsRooms.get(ws);
  if (!info) return;
  wsRooms.delete(ws);
  const key = wsRoomKey(info.siteId, info.pageId);
  const data = JSON.stringify({ type: "leave", userId: info.userId });
  for (const [other, otherInfo] of wsRooms) {
    if (other !== ws && other.readyState === 1 && wsRoomKey(otherInfo.siteId, otherInfo.pageId) === key) {
      other.send(data);
    }
  }
}

const root = resolve(import.meta.dirname, "../..");

function apiPlugin(): Plugin {
  let apiApp: ReturnType<typeof Object>;
  let tailwindFn: ReturnType<typeof Object>;
  let iframeBaseCSSFn: ReturnType<typeof Object>;
  let fontCSSResult: Promise<{ css: string; fontDirs: Map<string, string> }>;
  let resolvedFontDirs: Map<string, string> = new Map();
  let resolvedFontCSS = "";

  return {
    name: "hi-api-middleware",
    enforce: "pre",
    async configureServer(server) {
      const [{ app: importedApp }, { tailwindCssResponse, iframeBaseCSS, fontCSSWithAbsoluteURLs }] = await Promise.all([
        import(resolve(root, "packages/editor/src/api/index.ts")),
        import(resolve(root, "packages/website/src/lib/tailwind.ts")),
      ]);
      apiApp = importedApp;
      tailwindFn = tailwindCssResponse;
      iframeBaseCSSFn = iframeBaseCSS;

      fontCSSResult = fontCSSWithAbsoluteURLs();
      fontCSSResult.then((r) => {
        resolvedFontCSS = r.css;
        resolvedFontDirs = r.fontDirs;
      });

      let wss: InstanceType<typeof WebSocketServer>;

      server.httpServer?.on("upgrade", (req, socket, head) => {
        if (req.url !== "/ws") return;
        if (!wss) {
          wss = new WebSocketServer({ noServer: true });
          wss.on("connection", (ws) => {
            ws.on("message", (raw: Buffer) => {
              let msg: Record<string, unknown>;
              try { msg = JSON.parse(raw.toString()); } catch { return; }
              if (msg.type === "join") handleWsJoin(wss, ws, msg);
              if (msg.type === "cursor") handleWsCursor(wss, ws, msg);
              if (msg.type === "update") handleWsUpdate(wss, ws, msg);
            });
            ws.on("close", () => handleWsLeave(wss, ws));
          });
        }
        wss.handleUpgrade(req, socket, head, (ws) => wss.emit("connection", ws, req));
      });

      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith("/api/") && !req.url?.startsWith("/fonts/")) return next();

        try {
          const url = new URL(req.url, `http://${req.headers.host}`);
          const method = req.method || "GET";

          if (url.pathname === "/api/iframe-base") {
            const base = await iframeBaseCSSFn();
            const css = [base, resolvedFontCSS].filter(Boolean).join("\n");
            res.writeHead(200, { "content-type": "text/css", "cache-control": "public, max-age=60" });
            res.end(css);
            return;
          }

          if (url.pathname.startsWith("/fonts/")) {
            const match = url.pathname.match(/^\/fonts\/([^/]+)\/files\/(.+)$/);
            if (match) {
              const [, pkgBaseName, fileName] = match;
              const dir = resolvedFontDirs.get(pkgBaseName!);
              if (dir) {
                const { readFile, stat } = await import("node:fs/promises");
                const { join } = await import("node:path");
                const filePath = join(dir, fileName!);
                try {
                  await stat(filePath);
                  const FONT_MIME: Record<string, string> = { ".woff2": "font/woff2", ".woff": "font/woff", ".ttf": "font/ttf" };
                  const ext = fileName!.lastIndexOf(".") >= 0 ? fileName!.slice(fileName!.lastIndexOf(".")) : "";
                  const contentType = FONT_MIME[ext] ?? "application/octet-stream";
                  const content = await readFile(filePath);
                  res.writeHead(200, { "content-type": contentType, "cache-control": "public, max-age=31536000, immutable" });
                  res.end(content);
                  return;
                } catch {}
              }
            }
            res.writeHead(404);
            res.end("Not Found");
            return;
          }

          let body: string | Buffer | undefined;
          if (method !== "GET" && method !== "HEAD") {
            const chunks: Buffer[] = [];
            for await (const chunk of req) chunks.push(chunk);
            const raw = Buffer.concat(chunks);
            const isMultipart = req.headers["content-type"]?.includes("multipart/form-data");
            body = isMultipart ? raw : raw.toString();
          }

          if (url.pathname === "/api/tailwind") {
            const parsed = body && typeof body === "string" ? JSON.parse(body) : {};
            const css = await tailwindFn(parsed.classes ?? []);
            res.writeHead(200, { "content-type": "text/css" });
            res.end(css);
            return;
          }

          const path = url.pathname.slice(4) || "/";
          const newUrl = new URL(path + url.search, url.origin);
          const headers: Record<string, string> = {};
          for (const [k, v] of Object.entries(req.headers)) {
            if (typeof v === "string") headers[k] = v;
            else if (Array.isArray(v)) headers[k] = v.join(", ");
          }
          if (body && typeof body === "string" && !headers["content-type"]) headers["content-type"] = "application/json";

          const newReq = new Request(newUrl, {
            method,
            headers,
            body: body || undefined,
          });

          const apiRes = await apiApp.fetch(newReq);
          const resHeaders: Record<string, string> = {};
          apiRes.headers.forEach((v: string, k: string) => { resHeaders[k] = v; });
          res.writeHead(apiRes.status, resHeaders);
          const responseBody = await apiRes.arrayBuffer();
          res.end(Buffer.from(responseBody));
        } catch (err) {
          console.error("API middleware error:", err);
          res.writeHead(500);
          res.end("Internal Server Error");
        }
      });
    },
  };
}

export default defineConfig({
  esbuild: {
    jsxImportSource: "preact",
    jsx: "automatic",
  },
  server: {
    fs: {
      allow: [
        root,
        resolve(root, "node_modules/.deno"),
        resolve(root, "node_modules"),
      ],
    },
  },
  plugins: [
    denoWorkspacePlugin(root, "@hi"),
    apiPlugin(),
    tailwindcss(),
  ],
  resolve: {
    alias: [
      { find: "react/jsx-runtime", replacement: "preact/jsx-runtime" },
      { find: "react-dom", replacement: "preact/compat" },
      { find: "react", replacement: "preact/compat" },
      { find: "lucide-react", replacement: resolve(root, "node_modules/lucide-preact/dist/esm/lucide-preact.js") },
      { find: "@fontsource-variable/geist", replacement: resolve(root, "node_modules/@fontsource-variable/geist") },
      { find: "@fontsource/fraunces", replacement: resolve(root, "node_modules/@fontsource/fraunces") },
      { find: "@fontsource/recursive", replacement: resolve(root, "node_modules/@fontsource/recursive") },
      { find: "@hi/editor/styles.css", replacement: resolve(root, "packages/editor/src/styles.css") },
      { find: "@hi/editor/api", replacement: resolve(root, "packages/editor/src/api/index.ts") },
      { find: "@hi/website/styles.css", replacement: resolve(root, "packages/website/src/styles.css") },
      { find: "@hi/database", replacement: resolve(root, "packages/database/src/index.ts") },
      { find: "@hi/editor", replacement: resolve(root, "packages/editor/src/index.ts") },
      { find: "@hi/render", replacement: resolve(root, "packages/render/src/index.ts") },
      { find: "@hi/utils", replacement: resolve(root, "packages/utils/src/index.ts") },
      { find: "@hi/website", replacement: resolve(root, "packages/website/src/index.ts") },
    ],
    dedupe: ["react", "react-dom", "react/jsx-runtime", "preact"],
  },
});
