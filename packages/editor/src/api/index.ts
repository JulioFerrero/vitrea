import { Hono } from "hono";
import { logger } from "hono/logger";
import { sitesRoute } from "./routes/sites";
import { pagesRoute } from "./routes/pages";
import { elementsRoute } from "./routes/elements";
import { filesRoute } from "./routes/files";
import { collectionsRoute } from "./routes/collections";
import { documentsRoute, batchDocumentsRoute } from "./routes/documents";
import { cmsQueryRoute } from "./routes/cms-query";

const app = new Hono();

app.use("*", logger());

app.route("/sites", sitesRoute);
app.route("/pages", pagesRoute);
app.route("/elements", elementsRoute);
app.route("/files", filesRoute);
app.route("/collections", collectionsRoute);
app.route("/documents", documentsRoute);
app.route("/documents/batch", batchDocumentsRoute);
app.route("/cms/query", cmsQueryRoute);

app.get("/health", (c) => c.json({ status: "ok" }));

export { app };
export type AppType = typeof app;
