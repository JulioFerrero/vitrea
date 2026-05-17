import { Hono } from "hono";
import type { RendererMap } from "./types";
import { RenderPage } from "./renderer";
import { createTailwindGenerator } from "./tailwind";

export interface SiteConfig {
  database: { url: string };
  renderer: RendererMap;
  themePath?: string;
  fontsPath?: string;
}

export function defineSiteConfig(config: SiteConfig): SiteConfig {
  return config;
}

export function createWebsiteServer(config: SiteConfig): Hono {
  const app = new Hono();
  const tw = createTailwindGenerator({
    themePath: config.themePath ?? "",
    stylesPath: config.fontsPath,
  });

  app.get("/health", (c) => c.json({ status: "ok" }));
  app.get("/api/tailwind", async (c) => {
    const classes = c.req.query("classes")?.split(" ").filter(Boolean) ?? [];
    const css = await tw.generateCSS(classes);
    return c.text(css, 200, { "content-type": "text/css" });
  });

  return app;
}
