import { defineElement, textField, textareaField, urlField } from "@hi/editor";
import { MousePointerClick } from "lucide-react";

export const ctaSection = defineElement({
  type: "cta-section",
  label: "CTA Section",
  icon: MousePointerClick,
  category: "section",
  isContainer: false,
  defaultStyles: {},
  defaultData: {
    headline: "Ready to build?",
    description: "Start creating beautiful pages with Hi Editor today. Free and open source.",
    ctaText: "Get Started",
    ctaHref: "#",
  },
  fields: [
    textField({ name: "headline", label: "Headline" }),
    textareaField({ name: "description", label: "Description", rows: 2 }),
    textField({ name: "ctaText", label: "CTA Text" }),
    urlField({ name: "ctaHref", label: "CTA URL" }),
  ],
  styleGroups: ["spacing"],
});
