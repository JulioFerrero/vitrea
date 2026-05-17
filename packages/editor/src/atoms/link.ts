import { defineAction } from "../builders/elements";
import { textField, urlField } from "../builders/fields";

export const linkElement = defineAction({
  type: "link",
  label: "Link",
  icon: "link",
  defaultStyles: { fontSize: "base", color: "#2563eb" },
  defaultData: { content: "Link text", href: "#" },
  fields: [
    textField({ name: "content", label: "Text" }),
    urlField({ name: "href", label: "Link URL" }),
  ],
});
