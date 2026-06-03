import type { PromptAnswers } from "../prompts.ts";

export function websitePkgDenoJson(): string {
  return JSON.stringify({
    name: "@site/website",
    version: "0.1.0",
    exports: { ".": "./src/index.ts" },
    imports: {
      "react": "npm:react@^19.1.0",
      "react/jsx-runtime": "npm:react@^19.1.0/jsx-runtime",
      "@hi/editor": "jsr:@hi/editor@^0.1.1",
      "@hi/render": "jsr:@hi/render@^0.1.0",
      "@hi/website": "jsr:@hi/website@^0.1.0",
      "@hi/cms": "jsr:@hi/cms@^0.1.0",
    },
    compilerOptions: {
      jsx: "react-jsx",
      jsxImportSource: "react",
    },
  }, null, 2);
}

export function websitePkgIndex(answers: PromptAnswers): string {
  const lines = [
    `export { PageRenderer, classesFromStyles, inlineStylesFromTokens, tailwindCssResponse, iframeBaseCSS, fontCSSWithAbsoluteURLs } from "@hi/website";`,
    `export type { RenderElement, ElementProps } from "@hi/website";`,
    `export { schema, websiteRenderer, elements } from "./elements/index.ts";`,
    `export { content } from "./elements/content.ts";`,
    `export { cmsStructure } from "./elements/structure.ts";`,
    `export { COMPONENT_REGISTRY, hasComponent } from "./components/index.ts";`,
  ];
  if (answers.includeExamples) {
    lines.push(
      `export { heroSection } from "./elements/hero-section.ts";`,
      `export { featuresSection } from "./elements/features-section.ts";`,
      `export { footerSection } from "./elements/footer-section.ts";`,
      `export { HeroSection } from "./components/hero-section.tsx";`,
      `export { FeaturesSection } from "./components/features-section.tsx";`,
      `export { FooterSection } from "./components/footer-section.tsx";`,
    );
  }
  return lines.join("\n") + "\n";
}

export function websitePkgElementsIndex(answers: PromptAnswers): string {
  const imports = [
    `import React from "react";`,
    `import type { EditorSchema, RendererAdapter } from "@hi/editor";`,
    `import {`,
    `  sectionElement, rowElement, columnElement, gridElement,`,
    `  headingElement, textElement, imageElement, buttonElement,`,
    `  linkElement, dividerElement, spacerElement, videoElement, htmlElement,`,
    `  spacingStyles, sizingStyles, typographyStyles, backgroundStyles,`,
    `  layoutStyles, borderStyles, effectsStyles,`,
    `} from "@hi/editor";`,
    `import { RenderPage } from "@hi/render";`,
    `import { COMPONENT_REGISTRY } from "../components/index.ts";`,
    `import { content } from "./content.ts";`,
    `import { cmsStructure } from "./structure.ts";`,
  ];

  if (answers.includeExamples) {
    imports.push(
      `import { heroSection } from "./hero-section.ts";`,
      `import { featuresSection } from "./features-section.ts";`,
      `import { footerSection } from "./footer-section.ts";`,
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

export const websiteRenderer: RendererAdapter = {
  PageRenderer: (props) => React.createElement(RenderPage, { ...props, renderer: COMPONENT_REGISTRY }),
};
`;
}

export function websitePkgContent(): string {
  return `export const content = [];
`;
}

export function websitePkgStructure(): string {
  return `import { defineStructure } from "@hi/cms";

export const cmsStructure = defineStructure(() => []);
`;
}

export function websitePkgComponentsIndex(answers: PromptAnswers): string {
  const imports = [
    `import type { ComponentType } from "react";`,
    `import type { ElementProps } from "@hi/render";`,
    `import { COMPONENT_REGISTRY as BASE_COMPONENT_REGISTRY } from "@hi/website";`,
  ];

  if (answers.includeExamples) {
    imports.push(
      `import { HeroSection } from "./hero-section.tsx";`,
      `import { FeaturesSection } from "./features-section.tsx";`,
      `import { FooterSection } from "./footer-section.tsx";`,
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
  ...(BASE_COMPONENT_REGISTRY as Record<string, ComponentType<ElementProps>>),
  ...customComponents,
};

export function hasComponent(type: string): boolean {
  return type in COMPONENT_REGISTRY;
}
`;
}

export function websiteElementHero(answers: PromptAnswers): string {
  return `import { defineElement, textField } from "@hi/editor";

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
    subtitle: "Build your website visually with Hi Editor.",
    primaryCtaText: "Get Started",
    primaryCtaHref: "#",
  },
});
`;
}

export function websiteElementFeatures(): string {
  return `import { defineElement, textField } from "@hi/editor";

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
    title: "Why teams choose Hi Editor",
    subtitle: "A minimal monorepo scaffold with a visual editor and a real website app.",
  },
});
`;
}

export function websiteElementFooter(answers: PromptAnswers): string {
  return `import { defineElement, textField } from "@hi/editor";

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
    text: "Built with Hi Editor",
  },
});
`;
}

export function websiteComponentHero(): string {
  return `import type { ElementProps } from "@hi/render";

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

export function websiteComponentFeatures(): string {
  return `import type { ElementProps } from "@hi/render";

const FEATURES = [
  { title: "Visual Editing", description: "Edit sections visually while keeping a clean app structure." },
  { title: "Lean Monorepo", description: "Generate only the apps and example package you actually own." },
  { title: "JSR First", description: "Consume the reusable Hi packages from JSR instead of vendoring the full repo." },
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

export function websiteComponentFooter(): string {
  return `import type { ElementProps } from "@hi/render";

export function FooterSection({ element, className, style, attrs }: ElementProps) {
  const brand = (element.data.brand as string) ?? "Brand";
  const text = (element.data.text as string) ?? "Built with Hi Editor";

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
