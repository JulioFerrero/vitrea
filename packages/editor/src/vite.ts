import { Buffer } from "node:buffer";
import { readFile, stat } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import type { IncomingMessage, ServerResponse } from "node:http";
import type { Duplex } from "node:stream";
import { WebSocketServer } from "ws";
import { createTailwindGenerator } from "@vitrea/render/tailwind";
import { app as apiApp } from "./api/index";

type ClientInfo = { userId: string; name: string; color: string; siteId: string; pageId: string };
type WsConnection = WebSocket & {
  on(event: "message", listener: (raw: Buffer) => void): void;
  on(event: "close", listener: () => void): void;
};

type BackendServer = {
  httpServer?: {
    on(
      event: "upgrade",
      listener: (
        req: IncomingMessage,
        socket: Duplex,
        head: Buffer,
      ) => void,
    ): void;
  } | null;
  middlewares: {
    use(
      handler: (
        req: IncomingMessage,
        res: ServerResponse,
        next: () => void,
      ) => void | Promise<void>,
    ): void;
  };
};

export interface EditorVitePluginOptions {
  themePath: string;
  stylesPath?: string;
}

const wsRooms = new Map<WebSocket, ClientInfo>();

function wsRoomKey(siteId: string, pageId: string) {
  return `${siteId}:${pageId}`;
}

function handleWsJoin(ws: WebSocket, msg: Record<string, unknown>) {
  const { userId, name, color, siteId, pageId } = msg as Record<string, string>;
  if (!userId || !siteId || !pageId) return;

  const old = wsRooms.get(ws);
  if (old?.userId === userId && old && wsRoomKey(old.siteId, old.pageId) === wsRoomKey(siteId, pageId)) {
    return;
  }

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

async function createFontCssWithAbsoluteUrls(stylesPath?: string): Promise<{ css: string; fontDirs: Map<string, string> }> {
  if (!stylesPath) {
    return { css: "", fontDirs: new Map() };
  }

  const stylesContent = await readFile(stylesPath, "utf-8");
  const fontDirs = new Map<string, string>();
  const parts: string[] = [];
  const importRegex = /@import\s+["']([^"']*fontsource[^"']+)["']/g;
  let match: RegExpExecArray | null;

  while ((match = importRegex.exec(stylesContent)) !== null) {
    const importSpecifier = match[1];
    if (!importSpecifier) continue;

    const pkgName = importSpecifier.replace(/\/index\.css$/, "").replace(/\/css$/, "");
    const pkgBaseName = pkgName.replace(/^@fontsource\//, "");

    try {
      let cssPath = "";
      try {
        cssPath = new URL(import.meta.resolve(pkgName + "/index.css")).pathname;
      } catch {
        const possiblePaths = [
          resolve(stylesPath, "../../../../node_modules", pkgName, "index.css"),
          resolve(stylesPath, "../../../node_modules", pkgName, "index.css"),
        ];

        for (const candidate of possiblePaths) {
          try {
            await stat(candidate);
            cssPath = candidate;
            break;
          } catch {
            // Try the next candidate path.
          }
        }
      }

      if (!cssPath) continue;

      const pkgDir = dirname(cssPath);
      const css = (await readFile(cssPath, "utf-8")).replace(/url\(\.\/files\//g, `url(/fonts/${pkgBaseName}/files/`);
      parts.push(css);
      fontDirs.set(pkgBaseName, join(pkgDir, "files"));
    } catch (error) {
      console.error(`[createEditorVitePlugin] Failed to load font CSS for ${pkgName}:`, error);
    }
  }

  return { css: parts.join("\n"), fontDirs };
}

async function readRequestBody(req: IncomingMessage): Promise<string | Buffer | undefined> {
  if (req.method === "GET" || req.method === "HEAD") return undefined;

  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  const raw = Buffer.concat(chunks);
  if (raw.length === 0) return undefined;

  const isMultipart = req.headers["content-type"]?.includes("multipart/form-data");
  return isMultipart ? raw : raw.toString();
}

export function createEditorVitePlugin(options: EditorVitePluginOptions) {
  const themeGenerator = createTailwindGenerator({ themePath: options.themePath });
  const stylesGenerator = createTailwindGenerator({
    themePath: options.themePath,
    stylesPath: options.stylesPath,
  });

  let resolvedFontDirs = new Map<string, string>();
  let resolvedFontCSS = "";
  let wss: InstanceType<typeof WebSocketServer> | undefined;

  async function attachBackend(server: BackendServer) {
    const fontAssets = await createFontCssWithAbsoluteUrls(options.stylesPath);
    resolvedFontCSS = fontAssets.css;
    resolvedFontDirs = fontAssets.fontDirs;

    server.httpServer?.on("upgrade", (req, socket, head) => {
      if (req.url !== "/ws") return;

      if (!wss) {
        wss = new WebSocketServer({ noServer: true });
        wss.on("connection", (ws: WsConnection) => {
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

      wss.handleUpgrade(req, socket, head, (ws: WsConnection) => wss?.emit("connection", ws, req));
    });

    server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
      if (!req.url?.startsWith("/api/") && !req.url?.startsWith("/fonts/")) return next();

      try {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const method = req.method || "GET";

        if (url.pathname === "/api/iframe-base") {
          const themeCSS = await themeGenerator.generateCSS(["font-display", "font-sans", "font-mono"]);
          const bodyCSS = `*,*::before,*::after{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;padding:0;min-height:100%;background-color:#0a0a0a;color:#e5e5e5;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}::selection{background-color:rgba(225,29,72,0.3);color:#fff}`;
          const css = [bodyCSS, themeCSS, resolvedFontCSS].filter(Boolean).join("\n");

          res.writeHead(200, { "content-type": "text/css", "cache-control": "public, max-age=60" });
          res.end(css);
          return;
        }

        if (url.pathname.startsWith("/fonts/")) {
          const match = /^\/fonts\/([^/]+)\/files\/(.+)$/.exec(url.pathname);
          const pkgBaseName = match?.[1];
          const fileName = match?.[2];
          const dir = pkgBaseName ? resolvedFontDirs.get(pkgBaseName) : undefined;

          if (!dir || !fileName) {
            res.writeHead(404);
            res.end("Not Found");
            return;
          }

          try {
            const filePath = join(dir, fileName);
            await stat(filePath);

            const fontMime: Record<string, string> = {
              ".woff2": "font/woff2",
              ".woff": "font/woff",
              ".ttf": "font/ttf",
            };
            const ext = fileName.includes(".") ? fileName.slice(fileName.lastIndexOf(".")) : "";
            const contentType = fontMime[ext] ?? "application/octet-stream";
            const content = await readFile(filePath);

            res.writeHead(200, {
              "content-type": contentType,
              "cache-control": "public, max-age=31536000, immutable",
            });
            res.end(content);
            return;
          } catch {
            res.writeHead(404);
            res.end("Not Found");
            return;
          }
        }

        const body = await readRequestBody(req);

        if (url.pathname === "/api/tailwind") {
          const parsed = body && typeof body === "string" ? JSON.parse(body) as { classes?: string[] } : {};
          const css = await stylesGenerator.generateCSS(parsed.classes ?? []);
          res.writeHead(200, { "content-type": "text/css" });
          res.end(css);
          return;
        }

        const path = url.pathname.slice(4) || "/";
        const proxyUrl = new URL(path + url.search, url.origin);
        const headers: Record<string, string> = {};

        for (const [key, value] of Object.entries(req.headers)) {
          if (typeof value === "string") headers[key] = value;
          else if (Array.isArray(value)) headers[key] = value.join(", ");
        }

        if (body && typeof body === "string" && !headers["content-type"]) {
          headers["content-type"] = "application/json";
        }

        const request = new Request(proxyUrl, {
          method,
          headers,
          body: typeof body === "string" ? body : body ? new Uint8Array(body) : undefined,
        });

        const response = await apiApp.fetch(request);
        const responseHeaders: Record<string, string> = {};
        response.headers.forEach((value, key) => {
          responseHeaders[key] = value;
        });

        res.writeHead(response.status, responseHeaders);
        res.end(Buffer.from(await response.arrayBuffer()));
      } catch (error) {
        console.error("Editor Vite plugin error:", error);
        res.writeHead(500);
        res.end("Internal Server Error");
      }
    });
  }

  return {
    name: "vitrea-editor-runtime",
    enforce: "pre" as const,
    async configureServer(server: BackendServer) {
      await attachBackend(server);
    },
    async configurePreviewServer(server: BackendServer) {
      await attachBackend(server);
    },
  };
}
