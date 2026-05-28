import type { PromptAnswers } from "../prompts.ts";

export function websitePkgDenoJson(): string {
  return JSON.stringify({
    name: "@local/website",
    version: "0.1.0",
    exports: { ".": "./src/index.ts" },
    imports: {
      "preact": "npm:preact@^10.29.1",
      "react": "npm:preact@^10.29.1/compat",
      "react/jsx-runtime": "npm:preact@^10.29.1/jsx-runtime",
      "@hi/editor": "jsr:@hi/editor@^0.1.0",
      "@hi/render": "jsr:@hi/render@^0.1.0",
      "@hi/website": "jsr:@hi/website@^0.1.0",
    },
    compilerOptions: {
      lib: ["dom", "dom.asynciterable", "dom.iterable", "deno.ns"],
      jsx: "precompile",
      jsxImportSource: "preact",
    },
  }, null, 2);
}

export function websitePkgIndex(answers: PromptAnswers): string {
  const lines = [""];
  if (answers.includeExamples) {
    lines.push(
      `export { heroSection } from "./elements/hero-section.ts";`,
      `export { featuresSection } from "./elements/features-section.ts";`,
      `export { footerSection } from "./elements/footer-section.ts";`,
      `export { HeroSection } from "./components/hero-section.tsx";`,
      `export { FeaturesSection } from "./components/features-section.tsx";`,
      `export { Footer } from "./components/footer.tsx";`,
    );
  }
  return lines.join("\n") + "\n";
}

export function websiteElementHero(answers: PromptAnswers): string {
  return `import { defineElement, textField } from "@hi/editor";

export const heroSection = defineElement({
  type: "hero-section",
  name: "Hero Section",
  icon: "sparkles",
  category: "section",
  fields: {
    heading: textField("Heading"),
    subtitle: textField("Subtitle"),
  },
  defaultProps: {
    heading: "Welcome to ${answers.projectName}",
    subtitle: "Built with Hi Editor",
  },
});
`;
}

export function websiteElementFeatures(): string {
  return `import { defineElement, textField } from "@hi/editor";

export const featuresSection = defineElement({
  type: "features-section",
  name: "Features",
  icon: "layout-grid",
  category: "section",
  fields: { title: textField("Title") },
  defaultProps: { title: "Features" },
});
`;
}

export function websiteElementFooter(): string {
  return `import { defineElement, textField } from "@hi/editor";

export const footerSection = defineElement({
  type: "footer-section",
  name: "Footer",
  icon: "panel-bottom",
  category: "section",
  fields: { text: textField("Text") },
  defaultProps: { text: "Built with Hi Editor" },
});
`;
}

export function websiteComponentHero(): string {
  return `export function HeroSection() {
  return (
    <section class="py-24 text-center">
      <h1 class="text-5xl font-bold">Welcome</h1>
      <p class="mt-4 text-lg text-gray-600">Built with Hi Editor</p>
    </section>
  );
}
`;
}

export function websiteComponentFeatures(): string {
  return `export function FeaturesSection() {
  return (
    <section class="py-24">
      <h2 class="text-3xl font-bold text-center mb-12">Features</h2>
      <div class="grid grid-cols-3 gap-8">
        <div class="p-6 border rounded-lg"><h3 class="font-semibold mb-2">Fast</h3><p class="text-sm text-gray-600">Deno-powered</p></div>
        <div class="p-6 border rounded-lg"><h3 class="font-semibold mb-2">Self-Hosted</h3><p class="text-sm text-gray-600">Full control</p></div>
        <div class="p-6 border rounded-lg"><h3 class="font-semibold mb-2">Open Source</h3><p class="text-sm text-gray-600">MIT licensed</p></div>
      </div>
    </section>
  );
}
`;
}

export function websiteComponentFooter(): string {
  return `export function Footer() {
  return (
    <footer class="py-8 border-t text-center text-sm text-gray-500">
      <p>Built with Hi Editor</p>
    </footer>
  );
}
`;
}
