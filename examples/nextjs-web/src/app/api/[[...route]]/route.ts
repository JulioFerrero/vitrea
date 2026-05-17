import { Hono } from "hono";
import { handle } from "hono/vercel";
import { app } from "@hi/editor/api";

export const runtime = "nodejs";

const apiApp = new Hono().route("/api", app);
const handler = handle(apiApp);

export { handler as GET, handler as POST, handler as PUT, handler as PATCH, handler as DELETE, handler as OPTIONS };
