import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { auth } from "@vitrea/auth";
import { authMiddleware } from "@vitrea/auth/middleware";
import { db, user } from "@vitrea/database";
import { sql } from "drizzle-orm";
import { sitesRoute } from "./routes/sites";
import { pagesRoute } from "./routes/pages";
import { filesRoute } from "./routes/files";
import { collectionsRoute } from "./routes/collections";
import { documentsRoute, batchDocumentsRoute } from "./routes/documents";
import { cmsQueryRoute } from "./routes/cms-query";
import { adminUsersRoute } from "./routes/admin-users";
import { siteMembersRoute } from "./routes/site-members";

const app = new Hono<{ Variables: { user: typeof auth.$Infer.Session.user | null; session: typeof auth.$Infer.Session.session | null } }>();

app.use("*", logger());

app.use(
  "/auth/*",
  cors({
    origin: (origin) => origin,
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["POST", "GET", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  }),
);

app.get("/auth/has-users", async (c) => {
  const [result] = await db.select({ count: sql<number>`count(*)` }).from(user);
  return c.json({ exists: (result?.count ?? 0) > 0 });
});

app.on(["POST", "GET"], "/auth/*", (c) => auth.handler(c.req.raw));

app.use("*", authMiddleware);

app.route("/sites", sitesRoute);
app.route("/pages", pagesRoute);
app.route("/files", filesRoute);
app.route("/collections", collectionsRoute);
app.route("/documents", documentsRoute);
app.route("/documents/batch", batchDocumentsRoute);
app.route("/cms/query", cmsQueryRoute);
app.route("/admin/users", adminUsersRoute);
app.route("/site-members", siteMembersRoute);

app.get("/health", (c) => c.json({ status: "ok" }));

export { app };
export type AppType = typeof app;
