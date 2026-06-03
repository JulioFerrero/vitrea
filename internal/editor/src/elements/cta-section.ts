import { defineElement, textField, textareaField, urlField, selectField } from "@vitrea/editor";

export const ctaSection = defineElement({
  type: "cta-section",
  label: "CTA Section",
  icon: "mouse-pointer-click",
  category: "section",
  isContainer: false,
  defaultStyles: {},
  defaultData: {
    headline: "Ready to build?",
    description: "Start creating beautiful pages with Hi Editor today. Free and open source.",
    ctaText: "Get Started",
    ctaHref: "#",
    theme: "dark",
  },
  fields: [
    textField({ name: "headline", label: "Headline" }),
    textareaField({ name: "description", label: "Description", rows: 2 }),
    textField({ name: "ctaText", label: "CTA Text" }),
    urlField({ name: "ctaHref", label: "CTA URL" }),
    selectField({ name: "theme", label: "Theme", options: ["dark", "light"] }),
  ],
  styleGroups: ["spacing"],
});
