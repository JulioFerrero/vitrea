import { defineElement, textField, textareaField, urlField } from "@hi/editor";

export const heroSection = defineElement({
  type: "hero-section",
  label: "Hero Section",
  icon: "sparkles",
  category: "section",
  isContainer: false,
  defaultStyles: {},
  defaultData: {
    headline: "Build pages\nvisually.",
    subheadline: "The self-hosted visual website builder. Design with atomic elements, store in PostgreSQL, render anywhere.",
    badge: "Open source visual builder",
    ctaText: "Get Started",
    ctaHref: "#",
    secondaryCtaText: "View Docs",
    secondaryCtaHref: "/docs",
  },
  fields: [
    textField({ name: "badge", label: "Badge" }),
    textareaField({ name: "headline", label: "Headline", rows: 3 }),
    textareaField({ name: "subheadline", label: "Subheadline", rows: 3 }),
    textField({ name: "ctaText", label: "Primary CTA Text" }),
    urlField({ name: "ctaHref", label: "Primary CTA URL" }),
    textField({ name: "secondaryCtaText", label: "Secondary CTA Text" }),
    urlField({ name: "secondaryCtaHref", label: "Secondary CTA URL" }),
  ],
  styleGroups: ["background"],
});
