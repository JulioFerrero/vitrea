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
