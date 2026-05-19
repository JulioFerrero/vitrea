import { createServer } from "@hi/editor/server";
import { tailwindCssResponse, iframeBaseCSS, fontCSSWithAbsoluteURLs } from "@hi/website";
import { join } from "node:path";
import { readFile, stat } from "node:fs/promises";

let cachedFontCSS = "";
let cachedFontDirs = new Map<string, string>();

async function initFonts() {
  const result = await fontCSSWithAbsoluteURLs();
  cachedFontCSS = result.css;
  cachedFontDirs = result.fontDirs;
}

initFonts();

const FONT_MIME: Record<string, string> = {
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
};

createServer({
  distDir: join(import.meta.dirname!, "dist"),
  tailwindCSS: (classes) => tailwindCssResponse(classes),
  iframeBaseCSS: async () => {
    const base = await iframeBaseCSS();
    return [base, cachedFontCSS].filter(Boolean).join("\n");
  },
  fontFileHandler: async (urlPathname: string) => {
    const match = urlPathname.match(/^\/fonts\/([^/]+)\/files\/(.+)$/);
    if (!match) return null;

    const [, pkgBaseName, fileName] = match;
    const dir = cachedFontDirs.get(pkgBaseName!);
    if (!dir) return null;

    const filePath = join(dir, fileName!);
    try {
      await stat(filePath);
      const ext = fileName!.lastIndexOf(".") >= 0 ? fileName!.slice(fileName!.lastIndexOf(".")) : "";
      const contentType = FONT_MIME[ext] ?? "application/octet-stream";
      const content = await readFile(filePath);
      return new Response(new Uint8Array(content), {
        headers: { "content-type": contentType, "cache-control": "public, max-age=31536000, immutable" },
      });
    } catch {
      return null;
    }
  },
});
