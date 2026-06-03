import { defineElement, textField, urlField, selectField } from "@vitrea/editor";

export const navBar = defineElement({
  type: "nav-bar",
  label: "Navigation Bar",
  icon: "panel-top",
  category: "section",
  isContainer: false,
  defaultStyles: {},
  defaultData: {
    brandName: "Hi Editor",
    link1Text: "Features", link1Href: "#features",
    link2Text: "Docs", link2Href: "/docs",
    ctaText: "Get Started", ctaHref: "#",
    theme: "dark",
  },
  fields: [
    textField({ name: "brandName", label: "Brand Name" }),
    textField({ name: "link1Text", label: "Link 1 Text" }),
    urlField({ name: "link1Href", label: "Link 1 URL" }),
    textField({ name: "link2Text", label: "Link 2 Text" }),
    urlField({ name: "link2Href", label: "Link 2 URL" }),
    textField({ name: "link3Text", label: "Link 3 Text" }),
    urlField({ name: "link3Href", label: "Link 3 URL" }),
    textField({ name: "ctaText", label: "CTA Text" }),
    urlField({ name: "ctaHref", label: "CTA URL" }),
    selectField({ name: "theme", label: "Theme", options: ["dark", "light"] }),
  ],
  styleGroups: ["background"],
});
