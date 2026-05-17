import { defineElement, textField, urlField } from "@hi/editor";
import { PanelTop } from "lucide-react";

export const navBar = defineElement({
  type: "nav-bar",
  label: "Navigation Bar",
  icon: PanelTop,
  category: "section",
  isContainer: false,
  defaultStyles: {},
  defaultData: {
    brandName: "Hi Editor",
    link1Text: "Features",
    link1Href: "#features",
    link2Text: "Docs",
    link2Href: "/docs",
    ctaText: "Get Started",
    ctaHref: "#",
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
  ],
  styleGroups: ["background"],
});
