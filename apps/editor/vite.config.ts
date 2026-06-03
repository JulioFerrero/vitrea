import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { Buffer } from "node:buffer";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { config as loadDotenv } from "dotenv";
import { WebSocketServer } from "ws";

const currentDir = dirname(fileURLToPath(import.meta.url));
loadDotenv({ path: resolve(currentDir, "../../.env") });

type ClientInfo = { userId: string; name: string; color: string; siteId: string; pageId: string };
const wsRooms = new Map<WebSocket, ClientInfo>();

function wsRoomKey(siteId: string, pageId: string) {
  return `${siteId}:${pageId}`;
}

function handleWsJoin(ws: WebSocket, msg: Record<string, unknown>) {
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

function handleWsCursor(ws: WebSocket, msg: Record<string, unknown>) {
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

function handleWsUpdate(ws: WebSocket, msg: Record<string, unknown>) {
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

function handleWsLeave(ws: WebSocket) {
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

function apiPlugin(): Plugin {
  let apiApp: { fetch: (req: Request) => Response | Promise<Response> };
  let tailwindFn: (classes: string[]) => Promise<string>;
  let iframeBaseCSSFn: () => Promise<string>;
  let resolvedFontDirs: Map<string, string> = new Map();
  let resolvedFontCSS = "";

  return {
    name: "vitrea-api-middleware",
    enforce: "pre",
    async configureServer(server) {
      const [{ app: importedApp }, { tailwindCssResponse, iframeBaseCSS, fontCSSWithAbsoluteURLs }] = await Promise.all([
        import("@vitrea/editor/api"),
        import("@internal/web/tailwind"),
      ]);
      apiApp = importedApp;
      tailwindFn = tailwindCssResponse;
      iframeBaseCSSFn = iframeBaseCSS;

      fontCSSWithAbsoluteURLs().then((result: { css: string; fontDirs: Map<string, string> }) => {
        resolvedFontCSS = result.css;
        resolvedFontDirs = result.fontDirs;
      });

      let wss: InstanceType<typeof WebSocketServer> | undefined;

      server.httpServer?.on("upgrade", (req, socket, head) => {
        if (req.url !== "/ws") return;
        if (!wss) {
          wss = new WebSocketServer({ noServer: true });
          wss.on("connection", (ws: any) => {
            ws.on("message", (raw: Buffer) => {
              let msg: Record<string, unknown>;
              try {
                msg = JSON.parse(raw.toString());
              } catch {
                return;
              }
              if (msg.type === "join") handleWsJoin(ws, msg);
              if (msg.type === "cursor") handleWsCursor(ws, msg);
              if (msg.type === "update") handleWsUpdate(ws, msg);
            });
            ws.on("close", () => handleWsLeave(ws));
          });
        }
        wss.handleUpgrade(req, socket, head, (ws: any) => wss?.emit("connection", ws, req));
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
                const { join } = await import("node:path");
                const { readFile, stat } = await import("node:fs/promises");
                const filePath = join(dir, fileName!);
                try {
                  await stat(filePath);
                  const fontMime: Record<string, string> = {
                    ".woff2": "font/woff2",
                    ".woff": "font/woff",
                    ".ttf": "font/ttf",
                  };
                  const ext = fileName!.lastIndexOf(".") >= 0 ? fileName!.slice(fileName!.lastIndexOf(".")) : "";
                  const contentType = fontMime[ext] ?? "application/octet-stream";
                  const content = await readFile(filePath);
                  res.writeHead(200, { "content-type": contentType, "cache-control": "public, max-age=31536000, immutable" });
                  res.end(content);
                  return;
                } catch {
                  // fall through to 404 below
                }
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
          for (const [key, value] of Object.entries(req.headers)) {
            if (typeof value === "string") headers[key] = value;
            else if (Array.isArray(value)) headers[key] = value.join(", ");
          }
          if (body && typeof body === "string" && !headers["content-type"]) {
            headers["content-type"] = "application/json";
          }

          const newReq = new Request(newUrl, {
            method,
            headers,
            body: typeof body === "string" ? body : body ? new Uint8Array(body) : undefined,
          });

          const apiRes = await apiApp.fetch(newReq);
          const resHeaders: Record<string, string> = {};
          apiRes.headers.forEach((value, key) => {
            resHeaders[key] = value;
          });
          res.writeHead(apiRes.status, resHeaders);
          const responseBody = await apiRes.arrayBuffer();
          res.end(Buffer.from(responseBody));
        } catch (error) {
          console.error("API middleware error:", error);
          res.writeHead(500);
          res.end("Internal Server Error");
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), apiPlugin(), tailwindcss()],
  resolve: {
    dedupe: ["react", "react-dom"],
  },
});
