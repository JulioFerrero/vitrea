import { defineElement, textField, textareaField, urlField, selectField } from "@vitrea/editor";

export const showcaseSection = defineElement({
  type: "showcase-section",
  label: "Showcase Section",
  icon: "monitor",
  category: "section",
  isContainer: false,
  defaultStyles: {},
  defaultData: {
    headline: "Design with precision",
    description: "A powerful visual editor that gives you full control over every element on your page. From typography to layout, every detail is editable.",
    ctaText: "Try it now",
    ctaHref: "/editor",
    imageSrc: "https://placehold.co/800x500/F5F0EB/9B8E82?text=Hi+Editor+Screenshot",
    imageAlt: "Hi Editor Interface",
    variant: "image-right",
    theme: "dark",
  },
  fields: [
    textField({ name: "headline", label: "Headline" }),
    textareaField({ name: "description", label: "Description", rows: 3 }),
    textField({ name: "ctaText", label: "CTA Text" }),
    urlField({ name: "ctaHref", label: "CTA URL" }),
    urlField({ name: "imageSrc", label: "Image URL" }),
    textField({ name: "imageAlt", label: "Image Alt Text" }),
    selectField({ name: "variant", label: "Layout", options: ["image-right", "image-left"] }),
    selectField({ name: "theme", label: "Theme", options: ["dark", "light"] }),
  ],
  styleGroups: ["spacing", "background"],
});
