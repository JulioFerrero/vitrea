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
      "@vitrea/editor": "^1.0.0",
      "@vitrea/render": "^1.0.0",
      "@vitrea/website": "^0.1.1",
      react: "^19.1.0",
    },
    devDependencies: {
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
  return `@import "@vitrea/website/styles.css";
`;
}

export function internalWebComponentsIndex(answers: PromptAnswers): string {
  const imports = [
    `import type { ComponentType } from "react";`,
    `import type { ElementProps } from "@vitrea/render";`,
    `import { COMPONENT_REGISTRY as BASE_COMPONENT_REGISTRY } from "@vitrea/website";`,
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
  ...(BASE_COMPONENT_REGISTRY as Record<string, ComponentType<ElementProps>>),
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
