import { Hono } from "hono";
import { logger } from "hono/logger";
import { sitesRoute } from "./routes/sites";
import { pagesRoute } from "./routes/pages";
import { elementsRoute } from "./routes/elements";
import { filesRoute } from "./routes/files";

const app = new Hono();

app.use("*", logger());

app.route("/sites", sitesRoute);
app.route("/pages", pagesRoute);
app.route("/elements", elementsRoute);
app.route("/files", filesRoute);

app.get("/health", (c) => c.json({ status: "ok" }));

export { app };
export type AppType = typeof app;
