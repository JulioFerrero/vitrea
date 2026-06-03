import { defineElement, textField, textareaField } from "@vitrea/editor";

export const featuresSection = defineElement({
  type: "features-section",
  label: "Features Section",
  icon: "layout-grid",
  category: "section",
  isContainer: false,
  defaultStyles: {},
  defaultData: {
    headline: "Why Hi Editor?",
    subtitle: "Everything you need to build beautiful websites, without the complexity.",
    features: [
      { title: "Visual Editor", description: "Build pages with atomic elements — headings, text, images, buttons, and more. No code required." },
      { title: "Self-hosted", description: "PostgreSQL + JSONB storage. No vendor lock-in, no third-party CMS. Your data stays on your server." },
      { title: "Open Source", description: "Free, open source, and fully extensible. Create custom element types with zero configuration." },
    ],
  },
  fields: [
    textField({ name: "headline", label: "Section Headline" }),
    textField({ name: "subtitle", label: "Subtitle" }),
    textareaField({ name: "features", label: "Features JSON", rows: 6 }),
  ],
  styleGroups: ["spacing", "background"],
});
