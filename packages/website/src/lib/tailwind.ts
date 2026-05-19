import { createTailwindGenerator } from "@hi/render";
import type { TailwindGenerator } from "@hi/render";

const THEME_PATH = new URL("../theme.css", import.meta.url).pathname;
const STYLES_PATH = new URL("../styles.css", import.meta.url).pathname;

const themeGenerator = createTailwindGenerator({ themePath: THEME_PATH });
const stylesGenerator = createTailwindGenerator({ themePath: THEME_PATH, stylesPath: STYLES_PATH });

export function tailwindCssResponse(classes: string[]): Promise<string> {
  return themeGenerator.generateCSS(classes);
}

export function tailwindHtmlMiddleware(options?: { fonts?: boolean }): ReturnType<TailwindGenerator["htmlMiddleware"]> {
  const gen = options?.fonts ? stylesGenerator : themeGenerator;
  return gen.htmlMiddleware();
}

export async function iframeBaseCSS(): Promise<string> {
  const bodyCSS = `*,*::before,*::after{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;padding:0;min-height:100%;background-color:#0a0a0a;color:#e5e5e5;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}::selection{background-color:rgba(225,29,72,0.3);color:#fff}`;

  const themeCSS = await themeGenerator.generateCSS(["font-display", "font-sans", "font-mono"]);

  return [bodyCSS, themeCSS].filter(Boolean).join("\n");
}

export async function fontCSSWithAbsoluteURLs(): Promise<{ css: string; fontDirs: Map<string, string> }> {
  const { readFile, readdir } = await import("node:fs/promises");
  const { join, dirname } = await import("node:path");

  const stylesContent = await readFile(STYLES_PATH, "utf-8");
  const fontDirs = new Map<string, string>();
  const parts: string[] = [];

  const importRegex = /@import\s+["']([^"']*fontsource[^"']+)["']/g;
  let match;

  while ((match = importRegex.exec(stylesContent)) !== null) {
    const importSpecifier = match[1]!;
    const pkgName = importSpecifier.replace(/\/index\.css$/, "").replace(/\/css$/, "");
    const pkgBaseName = pkgName.replace(/^@fontsource\//, "");

    try {
      let cssPath: string;
      try {
        const modUrl = import.meta.resolve(pkgName + "/index.css");
        cssPath = new URL(modUrl).pathname;
      } catch {
        const { resolve } = await import("node:path");
        const possiblePaths = [
          resolve(STYLES_PATH, "../../../../node_modules", pkgName, "index.css"),
          resolve(STYLES_PATH, "../../../node_modules", pkgName, "index.css"),
        ];
        cssPath = "";
        for (const p of possiblePaths) {
          try {
            const { stat } = await import("node:fs/promises");
            await stat(p);
            cssPath = p;
            break;
          } catch {}
        }
        if (!cssPath) continue;
      }

      const pkgDir = dirname(cssPath);
      let css = await readFile(cssPath, "utf-8");
      css = css.replace(/url\(\.\/files\//g, `url(/fonts/${pkgBaseName}/files/`);

      parts.push(css);
      fontDirs.set(pkgBaseName, join(pkgDir, "files"));
    } catch (e) {
      console.error(`[fontCSSWithAbsoluteURLs] Failed for ${pkgName}:`, e);
    }
  }

  return { css: parts.join("\n"), fontDirs };
}
