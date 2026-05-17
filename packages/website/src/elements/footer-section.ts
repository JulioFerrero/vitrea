import { defineElement, textField, textareaField, urlField } from "@hi/editor";
import { PanelBottom } from "lucide-react";

export const footerSection = defineElement({
  type: "footer-section",
  label: "Footer Section",
  icon: PanelBottom,
  category: "section",
  isContainer: false,
  defaultStyles: {},
  defaultData: {
    brandName: "Hi Editor",
    description: "The self-hosted visual website builder.",
    copyrightText: "© 2026 Hi Editor. Open source under MIT.",
    link1Text: "GitHub",
    link1Href: "https://github.com",
    link2Text: "Docs",
    link2Href: "/docs",
    link3Text: "Twitter",
    link3Href: "https://twitter.com",
  },
  fields: [
    textField({ name: "brandName", label: "Brand Name" }),
    textField({ name: "description", label: "Description" }),
    textField({ name: "copyrightText", label: "Copyright" }),
    textField({ name: "link1Text", label: "Link 1 Text" }),
    urlField({ name: "link1Href", label: "Link 1 URL" }),
    textField({ name: "link2Text", label: "Link 2 Text" }),
    urlField({ name: "link2Href", label: "Link 2 URL" }),
    textField({ name: "link3Text", label: "Link 3 Text" }),
    urlField({ name: "link3Href", label: "Link 3 URL" }),
    textField({ name: "link4Text", label: "Link 4 Text" }),
    urlField({ name: "link4Href", label: "Link 4 URL" }),
  ],
  styleGroups: ["spacing"],
});
