import { createServer as createHttpServer, type IncomingMessage, type ServerResponse } from "node:http";
import { join } from "node:path";
import { readFile, stat } from "node:fs/promises";
import { Buffer } from "node:buffer";
import { WebSocket, WebSocketServer } from "ws";
import { app as apiApp } from "./api/index";

type ClientInfo = { userId: string; name: string; color: string; siteId: string; pageId: string };
type MessageData = string | Buffer | ArrayBuffer | Buffer[];
type ServerSocket = WebSocket & {
  on(event: "message", listener: (raw: MessageData) => void): void;
  on(event: "close" | "error", listener: () => void): void;
};

const rooms = new Map<string, Map<WebSocket, ClientInfo>>();

function getRoom(key: string) {
  let room = rooms.get(key);
  if (!room) {
    room = new Map();
    rooms.set(key, room);
  }
  return room;
}

function roomKey(siteId: string, pageId: string) {
  return `${siteId}:${pageId}`;
}

function broadcast(key: string, from: WebSocket, msg: object) {
  const room = rooms.get(key);
  if (!room) return;
  const data = JSON.stringify(msg);
  for (const [ws] of room) {
    if (ws !== from && ws.readyState === WebSocket.OPEN) {
      ws.send(data);
    }
  }
}

function parseRawMessage(raw: MessageData): string {
  if (typeof raw === "string") return raw;
  if (Buffer.isBuffer(raw)) return raw.toString("utf8");
  if (Array.isArray(raw)) return Buffer.concat(raw).toString("utf8");
  return Buffer.from(raw).toString("utf8");
}

function handleMessage(ws: WebSocket, raw: MessageData) {
  let msg: Record<string, unknown>;
  try {
    msg = JSON.parse(parseRawMessage(raw));
  } catch {
    return;
  }

  if (msg.type === "join") {
    const { userId, name, color, siteId, pageId } = msg as Record<string, string>;
    if (!userId || !siteId || !pageId) return;

    for (const [key, existing] of rooms) {
      if (existing.delete(ws) && existing.size === 0) {
        rooms.delete(key);
      }
    }

    const key = roomKey(siteId, pageId);
    const room = getRoom(key);
    for (const [, info] of room) {
      ws.send(JSON.stringify({ type: "join", userId: info.userId, name: info.name, color: info.color }));
    }
    room.set(ws, { userId, name, color, siteId, pageId });
    broadcast(key, ws, { type: "join", userId, name, color });
  }

  if (msg.type === "cursor") {
    const info = findClient(ws);
    if (!info) return;
    const key = roomKey(info.siteId, info.pageId);
    broadcast(key, ws, { type: "cursor", userId: info.userId, x: msg.x, y: msg.y });
  }

  if (msg.type === "update") {
    const info = findClient(ws);
    if (!info) return;
    const key = roomKey(info.siteId, info.pageId);
    const elementId = msg.elementId as string;
    const patch = msg.patch as Record<string, unknown>;
    if (!elementId || !patch) return;
    broadcast(key, ws, { type: "update", elementId, patch });
  }
}

function findClient(ws: WebSocket): ClientInfo | undefined {
  for (const [, room] of rooms) {
    const info = room.get(ws);
    if (info) return info;
  }
  return undefined;
}

function handleDisconnect(ws: WebSocket) {
  for (const [key, room] of rooms) {
    const info = room.get(ws);
    if (!info) continue;
    room.delete(ws);
    broadcast(key, ws, { type: "leave", userId: info.userId });
    if (room.size === 0) rooms.delete(key);
    return;
  }
}

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

async function readRequestBody(req: IncomingMessage): Promise<Buffer | undefined> {
  if (req.method === "GET" || req.method === "HEAD") return undefined;
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return chunks.length > 0 ? Buffer.concat(chunks) : undefined;
}

function writeFetchResponse(res: ServerResponse, response: Response) {
  const headers: Record<string, string> = {};
  response.headers.forEach((value, key) => {
    headers[key] = value;
  });
  res.writeHead(response.status, headers);
  return response.arrayBuffer().then((body) => {
    res.end(Buffer.from(body));
  });
}

export function createServer(options: CreateServerOptions) {
  const {
    port = 5173,
    hostname = "0.0.0.0",
    distDir,
    tailwindCSS,
    iframeBaseCSS,
    fontFileHandler,
  } = options;

  const server = createHttpServer(async (req, res) => {
    try {
      const url = new URL(req.url ?? "/", `http://${req.headers.host ?? `${hostname}:${port}`}`);

      if (url.pathname === "/api/tailwind" && req.method === "POST" && tailwindCSS) {
        const rawBody = await readRequestBody(req);
        const parsed = rawBody ? JSON.parse(rawBody.toString("utf8")) : {};
        res.writeHead(200, { "content-type": "text/css" });
        res.end(await tailwindCSS(parsed.classes ?? []));
        return;
      }

      if (url.pathname === "/api/iframe-base" && iframeBaseCSS) {
        res.writeHead(200, { "content-type": "text/css", "cache-control": "public, max-age=60" });
        res.end(await iframeBaseCSS());
        return;
      }

      if (url.pathname.startsWith("/fonts/") && fontFileHandler) {
        const response = await fontFileHandler(url.pathname);
        if (response) {
          await writeFetchResponse(res, response);
          return;
        }
      }

      if (url.pathname.startsWith("/api/")) {
        const path = url.pathname.slice(4) || "/";
        const proxyUrl = new URL(path + url.search, url.origin);
        const body = await readRequestBody(req);
        const headers = new Headers();
        for (const [key, value] of Object.entries(req.headers)) {
          if (typeof value === "string") headers.set(key, value);
          else if (Array.isArray(value)) headers.set(key, value.join(", "));
        }
        const request = new Request(proxyUrl, {
          method: req.method,
          headers,
          body: body ? new Uint8Array(body) : undefined,
        });
        await writeFetchResponse(res, await apiApp.fetch(request));
        return;
      }

      let filePath = join(distDir, url.pathname === "/" ? "index.html" : url.pathname);
      try {
        await stat(filePath);
      } catch {
        filePath = join(distDir, "index.html");
      }

      try {
        const content = await readFile(filePath);
        res.writeHead(200, { "content-type": getMimeType(filePath) });
        res.end(content);
      } catch {
        res.writeHead(404);
        res.end("Not Found");
      }
    } catch {
      res.writeHead(500);
      res.end("Internal Server Error");
    }
  });

  const wss = new WebSocketServer({ noServer: true });
  wss.on("connection", (ws: unknown) => {
    const socket = ws as ServerSocket;
    socket.on("message", (raw) => handleMessage(socket, raw));
    socket.on("close", () => handleDisconnect(socket));
    socket.on("error", () => handleDisconnect(socket));
  });

  server.on("upgrade", (req, socket, head) => {
    if (req.url !== "/ws") {
      socket.destroy();
      return;
    }

    wss.handleUpgrade(req, socket, head, (ws: unknown) => {
      wss.emit("connection", ws, req);
    });
  });

  server.listen(port, hostname);
  return server;
}
