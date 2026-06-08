import type { PromptAnswers } from "../prompts";

export function internalWebPackageJson(): string {
  return JSON.stringify({
    name: "@internal/web",
    version: "0.1.0",
    private: true,
    type: "module",
    exports: {
      ".": "./src/index.ts",
      "./tailwind": "./src/lib/tailwind.ts",
      "./styles.css": "./src/styles.css",
    },
    dependencies: {
      "@fontsource/fraunces": "^5.2.9",
      "@fontsource/recursive": "^5.2.8",
      "@vitrea/editor": "^1.0.0",
      "@vitrea/render": "^1.0.0",
      react: "^19.1.0",
    },
    devDependencies: {
      "@types/node": "^22.10.2",
      "@types/react": "^19.1.0",
      typescript: "^5.7.2",
    },
  }, null, 2) + "\n";
}

export function internalEditorPackageJson(): string {
  return JSON.stringify({
    name: "@internal/editor",
    version: "0.1.0",
    private: true,
    type: "module",
    exports: {
      ".": "./src/index.ts",
    },
    dependencies: {
      "@vitrea/cms": "^1.0.0",
      "@vitrea/editor": "^1.0.0",
    },
    devDependencies: {
      typescript: "^5.7.2",
    },
  }, null, 2) + "\n";
}

export function internalPkgTsconfig(): string {
  return JSON.stringify({
    extends: "../../tsconfig.base.json",
    compilerOptions: {
      jsx: "react-jsx",
    },
    include: ["src/**/*.ts", "src/**/*.tsx"],
  }, null, 2) + "\n";
}

export function internalWebIndex(): string {
  return [
    `export { PageRenderer, classesFromStyles, inlineStylesFromTokens, websiteRenderer } from "./renderer";`,
    `export type { RenderElement, ElementProps } from "./renderer";`,
    `export { COMPONENT_REGISTRY, hasComponent } from "./components";`,
    ``,
  ].join("\n");
}

export function internalWebRenderer(): string {
  return `import React from "react";
import type { RendererAdapter } from "@vitrea/editor";
import { RenderPage } from "@vitrea/render";
import type { RenderElement } from "@vitrea/render";
import { COMPONENT_REGISTRY } from "./components";

function PageRendererWrapper(props: { content: RenderElement[] }) {
  return React.createElement(RenderPage, { content: props.content, renderer: COMPONENT_REGISTRY });
}

export { PageRendererWrapper as PageRenderer };
export { classesFromStyles, inlineStylesFromTokens } from "@vitrea/render";
export type { RenderElement, ElementProps } from "@vitrea/render";

export const websiteRenderer: RendererAdapter = {
  PageRenderer: (props) => React.createElement(RenderPage, { ...props, renderer: COMPONENT_REGISTRY }),
};
`;
}

export function internalWebStylesCss(): string {
  return `@source "../";
@import "./theme.css";
@import "@fontsource/fraunces/index.css";
@import "@fontsource/recursive/index.css";

html {
  scroll-behavior: smooth;
}

body {
  background-color: #0a0a0a;
  color: #e5e5e5;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

::selection {
  background-color: rgba(225, 29, 72, 0.3);
  color: #fff;
}
`;
}

export function internalWebComponentsIndex(answers: PromptAnswers): string {
  const imports = [
    `import type { ComponentType } from "react";`,
    `import type { ElementProps } from "@vitrea/render";`,
    `import { Section } from "./section";`,
    `import { Row } from "./row";`,
    `import { Column } from "./column";`,
    `import { Grid } from "./grid";`,
    `import { Heading } from "./heading";`,
    `import { Text } from "./text";`,
    `import { Image } from "./image";`,
    `import { Button } from "./button";`,
    `import { Link } from "./link";`,
    `import { Spacer } from "./spacer";`,
    `import { Divider } from "./divider";`,
    `import { Video } from "./video";`,
    `import { Html } from "./html";`,
  ];

  if (answers.includeExamples) {
    imports.push(
      `import { HeroSection } from "./hero-section";`,
      `import { FeaturesSection } from "./features-section";`,
      `import { FooterSection } from "./footer-section";`,
    );
  }

  const customComponents = answers.includeExamples
    ? `const customComponents: Record<string, ComponentType<ElementProps>> = {
  "hero-section": HeroSection,
  "features-section": FeaturesSection,
  "footer-section": FooterSection,
};`
    : `const customComponents: Record<string, ComponentType<ElementProps>> = {};`;

  return `${imports.join("\n")}

${customComponents}

export const COMPONENT_REGISTRY: Record<string, ComponentType<ElementProps>> = {
  section: Section,
  row: Row,
  column: Column,
  grid: Grid,
  heading: Heading,
  text: Text,
  image: Image,
  button: Button,
  link: Link,
  spacer: Spacer,
  divider: Divider,
  video: Video,
  html: Html,
  ...customComponents,
};

export function hasComponent(type: string): boolean {
  return type in COMPONENT_REGISTRY;
}
`;
}

export function internalEditorIndex(): string {
  return [
    `export { schema, elements } from "./elements";`,
    `export { content } from "./elements/content";`,
    `export { cmsStructure } from "./elements/structure";`,
    ``,
  ].join("\n");
}

export function internalEditorElementsIndex(answers: PromptAnswers): string {
  const imports = [
    `import type { EditorSchema } from "@vitrea/editor";`,
    `import {`,
    `  sectionElement, rowElement, columnElement, gridElement,`,
    `  headingElement, textElement, imageElement, buttonElement,`,
    `  linkElement, dividerElement, spacerElement, videoElement, htmlElement,`,
    `  spacingStyles, sizingStyles, typographyStyles, backgroundStyles,`,
    `  layoutStyles, borderStyles, effectsStyles,`,
    `} from "@vitrea/editor";`,
    `import { content } from "./content";`,
    `import { cmsStructure } from "./structure";`,
  ];

  if (answers.includeExamples) {
    imports.push(
      `import { heroSection } from "./hero-section";`,
      `import { featuresSection } from "./features-section";`,
      `import { footerSection } from "./footer-section";`,
    );
  }

  const customElements = answers.includeExamples
    ? `const customElements = [heroSection, featuresSection, footerSection];`
    : `const customElements: EditorSchema["elementTypes"] = [];`;

  return `${imports.join("\n")}

${customElements}

export const elements = [
  sectionElement,
  rowElement,
  columnElement,
  gridElement,
  headingElement,
  textElement,
  imageElement,
  buttonElement,
  linkElement,
  dividerElement,
  spacerElement,
  videoElement,
  htmlElement,
  ...customElements,
];

export const schema: EditorSchema = {
  elementTypes: elements,
  styleGroups: {
    spacing: spacingStyles,
    sizing: sizingStyles,
    typography: typographyStyles,
    background: backgroundStyles,
    layout: layoutStyles,
    border: borderStyles,
    effects: effectsStyles,
  },
  content,
  structure: cmsStructure,
};
`;
}

export function internalEditorContent(): string {
  return `export const content = [];
`;
}

export function internalEditorStructure(): string {
  return `import { defineStructure } from "@vitrea/cms";

export const cmsStructure = defineStructure(() => []);
`;
}

export function internalEditorElementHero(answers: PromptAnswers): string {
  return `import { defineElement, textField } from "@vitrea/editor";

export const heroSection = defineElement({
  type: "hero-section",
  label: "Hero Section",
  icon: "sparkles",
  category: "section",
  isContainer: false,
  defaultStyles: {},
  fields: [
    textField({ name: "heading", label: "Heading" }),
    textField({ name: "subtitle", label: "Subtitle" }),
    textField({ name: "primaryCtaText", label: "Primary CTA Text" }),
    textField({ name: "primaryCtaHref", label: "Primary CTA URL" }),
  ],
  styleGroups: ["spacing", "background"],
  defaultData: {
    heading: "Welcome to ${answers.projectName}",
    subtitle: "Build your website visually with Vitrea.",
    primaryCtaText: "Get Started",
    primaryCtaHref: "#",
  },
});
`;
}

export function internalEditorElementFeatures(): string {
  return `import { defineElement, textField } from "@vitrea/editor";

export const featuresSection = defineElement({
  type: "features-section",
  label: "Features Section",
  icon: "layout-grid",
  category: "section",
  isContainer: false,
  defaultStyles: {},
  fields: [
    textField({ name: "title", label: "Title" }),
    textField({ name: "subtitle", label: "Subtitle" }),
  ],
  styleGroups: ["spacing", "background"],
  defaultData: {
    title: "Why teams choose Vitrea",
    subtitle: "A pnpm monorepo scaffold with a real website app and a visual editor.",
  },
});
`;
}

export function internalEditorElementFooter(answers: PromptAnswers): string {
  return `import { defineElement, textField } from "@vitrea/editor";

export const footerSection = defineElement({
  type: "footer-section",
  label: "Footer Section",
  icon: "panel-bottom",
  category: "section",
  isContainer: false,
  defaultStyles: {},
  fields: [
    textField({ name: "brand", label: "Brand" }),
    textField({ name: "text", label: "Text" }),
  ],
  styleGroups: ["spacing", "background"],
  defaultData: {
    brand: "${answers.projectName}",
    text: "Built with Vitrea",
  },
});
`;
}

export function internalWebThemeCss(): string {
  return `@source "../";

@theme {
  --font-display: "Fraunces", Georgia, "Times New Roman", serif;
  --font-sans: "Recursive", system-ui, -apple-system, sans-serif;
  --font-mono: "Recursive Menlo", "Recursive", monospace;

  --color-cherry-50: #fff1f2;
  --color-cherry-100: #ffe4e6;
  --color-cherry-200: #fecdd3;
  --color-cherry-300: #fda4af;
  --color-cherry-400: #fb7185;
  --color-cherry-500: #f43f5e;
  --color-cherry-600: #e11d48;
  --color-cherry-700: #be123c;
  --color-cherry-800: #9f1239;
  --color-cherry-900: #881337;
  --color-cherry-950: #4c0519;

  --color-warm-50: #fffbf5;
  --color-warm-100: #fff5eb;
  --color-warm-200: #ffecd2;
  --color-warm-300: #ffd9a8;

  --color-surface: #fffbf5;
  --color-surface-alt: #fff5eb;

  --color-dark-50: #fafafa;
  --color-dark-100: #f5f5f5;
  --color-dark-200: #e5e5e5;
  --color-dark-300: #d4d4d4;
  --color-dark-400: #a3a3a3;
  --color-dark-500: #737373;
  --color-dark-600: #525252;
  --color-dark-700: #404040;
  --color-dark-800: #262626;
  --color-dark-900: #171717;
  --color-dark-950: #0a0a0a;
}
`;
}

export function internalWebTailwind(): string {
  return `import { createTailwindGenerator } from "@vitrea/render/tailwind";
import type { TailwindGenerator } from "@vitrea/render/tailwind";

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
  const bodyCSS = \`*,*::before,*::after{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;padding:0;min-height:100%;background-color:#0a0a0a;color:#e5e5e5;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}::selection{background-color:rgba(225,29,72,0.3);color:#fff}\`;
  const themeCSS = await themeGenerator.generateCSS(["font-display", "font-sans", "font-mono"]);
  return [bodyCSS, themeCSS].filter(Boolean).join("\\n");
}

export async function fontCSSWithAbsoluteURLs(): Promise<{ css: string; fontDirs: Map<string, string> }> {
  const { readFile, stat } = await import("node:fs/promises");
  const { resolve, dirname, join } = await import("node:path");

  const stylesContent = await readFile(STYLES_PATH, "utf-8");
  const fontDirs = new Map<string, string>();
  const parts: string[] = [];
  const importRegex = /@import\\s+["']([^"']*fontsource[^"']+)["']/g;
  let match: RegExpExecArray | null;

  while ((match = importRegex.exec(stylesContent)) !== null) {
    const importSpecifier = match[1]!;
    const pkgName = importSpecifier.replace(/\\/index\\.css$/, "").replace(/\\/css$/, "");
    const pkgBaseName = pkgName.replace(/^@fontsource\\//, "");
    const cssPath = resolve(STYLES_PATH, "../../../../node_modules", pkgName, "index.css");

    try {
      await stat(cssPath);
      let css = await readFile(cssPath, "utf-8");
      css = css.replace(/url\\(\\.\\/files\\//g, \`url(/fonts/\${pkgBaseName}/files/\`);
      parts.push(css);
      fontDirs.set(pkgBaseName, join(dirname(cssPath), "files"));
    } catch {}
  }

  return { css: parts.join("\\n"), fontDirs };
}
`;
}

export function internalWebComponentSection(): string {
  return `import type { ElementProps } from "@vitrea/render";

export function Section({ element: _element, className, style, children, attrs }: ElementProps) {
  return <section {...attrs} className={className} style={style}>{children}</section>;
}
`;
}

export function internalWebComponentRow(): string {
  return `import type { ElementProps } from "@vitrea/render";

export function Row({ element: _element, className, style, children, attrs }: ElementProps) {
  return <div {...attrs} className={className} style={style}>{children}</div>;
}
`;
}

export function internalWebComponentColumn(): string {
  return `import type { ElementProps } from "@vitrea/render";

export function Column({ element: _element, className, style, children, attrs }: ElementProps) {
  return <div {...attrs} className={className} style={style}>{children}</div>;
}
`;
}

export function internalWebComponentGrid(): string {
  return `import type { ElementProps } from "@vitrea/render";

export function Grid({ element: _element, className, style, children, attrs }: ElementProps) {
  return <div {...attrs} className={className} style={style}>{children}</div>;
}
`;
}

export function internalWebComponentHeading(): string {
  return `import type React from "react";
import type { ElementProps } from "@vitrea/render";

const TAG_MAP: Record<string, string> = {
  h1: "h1", h2: "h2", h3: "h3", h4: "h4", h5: "h5", h6: "h6",
  p: "p", span: "span",
};

export function Heading({ element, className, style, attrs }: ElementProps) {
  const d = element.data as { tagName?: string; content?: string };
  const Tag = (TAG_MAP[d.tagName ?? "h2"] ?? "h2") as keyof React.JSX.IntrinsicElements;
  return <Tag {...attrs} className={className} style={style}>{d.content ?? ""}</Tag>;
}
`;
}

export function internalWebComponentText(): string {
  return `import type { ElementProps } from "@vitrea/render";

export function Text({ element, className, style, attrs }: ElementProps) {
  const content = element.data.content as string | undefined;
  if (content && content.includes("<")) {
    return <div {...attrs} className={className} style={style} dangerouslySetInnerHTML={{ __html: content }} />;
  }
  return <p {...attrs} className={className} style={style}>{content ?? ""}</p>;
}
`;
}

export function internalWebComponentImage(): string {
  return `import React from "react";
import type { ElementProps } from "@vitrea/render";

function ImageInner({ element, className, style, attrs }: ElementProps) {
  const d = element.data as { src?: string; alt?: string };
  return (
    <img
      {...attrs}
      src={d.src}
      alt={d.alt ?? ""}
      className={className}
      style={style}
      loading="lazy"
    />
  );
}

export const Image = React.memo(ImageInner);
`;
}

export function internalWebComponentButton(): string {
  return `import type { ElementProps } from "@vitrea/render";

export function Button({ element, className, style, attrs }: ElementProps) {
  const d = element.data as { href?: string; target?: string; content?: string };
  return (
    <a {...attrs} href={d.href ?? "#"} target={d.target} className={className} style={style}>
      {d.content ?? "Button"}
    </a>
  );
}
`;
}

export function internalWebComponentLink(): string {
  return `import type { ElementProps } from "@vitrea/render";

export function Link({ element, className, style, attrs }: ElementProps) {
  const d = element.data as { href?: string; target?: string; content?: string };
  return (
    <a {...attrs} href={d.href ?? "#"} target={d.target} className={className} style={style}>
      {d.content ?? d.href ?? ""}
    </a>
  );
}
`;
}

export function internalWebComponentSpacer(): string {
  return `import type { ElementProps } from "@vitrea/render";

export function Spacer({ element: _element, className, style, attrs }: ElementProps) {
  return <div {...attrs} className={className} style={style} />;
}
`;
}

export function internalWebComponentDivider(): string {
  return `import type { ElementProps } from "@vitrea/render";

export function Divider({ element: _element, className, style, attrs }: ElementProps) {
  return <hr {...attrs} className={className} style={style} />;
}
`;
}

export function internalWebComponentVideo(): string {
  return `import React from "react";
import type { ElementProps } from "@vitrea/render";

function VideoInner({ element, className, style, attrs }: ElementProps) {
  const d = element.data as { src?: string; autoPlay?: boolean; loop?: boolean };
  return (
    <video
      {...attrs}
      src={d.src}
      controls
      autoPlay={d.autoPlay}
      loop={d.loop}
      className={className}
      style={style}
    />
  );
}

export const Video = React.memo(VideoInner);
`;
}

export function internalWebComponentHtml(): string {
  return `import type { ElementProps } from "@vitrea/render";

export function Html({ element, className, style, attrs }: ElementProps) {
  return <div {...attrs} className={className} style={style} dangerouslySetInnerHTML={{ __html: element.data.content ?? "" }} />;
}
`;
}

export function internalWebComponentHero(): string {
  return `import type { ElementProps } from "@vitrea/render";

export function HeroSection({ element, className, style, attrs }: ElementProps) {
  const heading = (element.data.heading as string) ?? "Welcome";
  const subtitle = (element.data.subtitle as string) ?? "";
  const primaryCtaText = (element.data.primaryCtaText as string) ?? "Get Started";
  const primaryCtaHref = (element.data.primaryCtaHref as string) ?? "#";

  return (
    <section {...attrs} className={\`px-6 py-24 text-center \${className ?? ""}\`} style={style}>
      <div className="mx-auto max-w-4xl">
        <span className="inline-flex rounded-full border border-black/10 px-3 py-1 text-xs uppercase tracking-[0.16em] text-black/60">
          Example Section
        </span>
        <h1 className="mt-6 text-5xl font-bold tracking-tight text-black">
          {heading}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-black/60">
          {subtitle}
        </p>
        <a
          href={primaryCtaHref}
          className="mt-8 inline-flex rounded-xl bg-black px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-black/85"
        >
          {primaryCtaText}
        </a>
      </div>
    </section>
  );
}
`;
}

export function internalWebComponentFeatures(): string {
  return `import type { ElementProps } from "@vitrea/render";

const FEATURES = [
  { title: "Visual Editing", description: "Edit sections visually while keeping a clean app structure." },
  { title: "pnpm Workspace", description: "Ship a normal Node monorepo without Deno or JSR-specific tooling." },
  { title: "Published Packages", description: "Depend on published Vitrea packages and only keep your site layer local." },
];

export function FeaturesSection({ element, className, style, attrs }: ElementProps) {
  const title = (element.data.title as string) ?? "Features";
  const subtitle = (element.data.subtitle as string) ?? "";

  return (
    <section {...attrs} className={\`px-6 py-24 \${className ?? ""}\`} style={style}>
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-black">{title}</h2>
          <p className="mt-3 text-base text-black/60">{subtitle}</p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {FEATURES.map((feature) => (
            <article key={feature.title} className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-black">{feature.title}</h3>
              <p className="mt-2 text-sm leading-6 text-black/60">{feature.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
`;
}

export function internalWebComponentFooter(): string {
  return `import type { ElementProps } from "@vitrea/render";

export function FooterSection({ element, className, style, attrs }: ElementProps) {
  const brand = (element.data.brand as string) ?? "Brand";
  const text = (element.data.text as string) ?? "Built with Vitrea";

  return (
    <footer {...attrs} className={\`border-t border-black/10 px-6 py-10 \${className ?? ""}\`} style={style}>
      <div className="mx-auto flex max-w-6xl flex-col gap-3 text-center md:flex-row md:items-center md:justify-between md:text-left">
        <span className="text-sm font-semibold text-black">{brand}</span>
        <p className="text-sm text-black/55">{text}</p>
      </div>
    </footer>
  );
}
`;
}
