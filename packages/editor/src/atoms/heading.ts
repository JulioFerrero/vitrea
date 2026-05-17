import { defineText } from "../builders/elements";
import { selectField, textareaField } from "../builders/fields";

export const headingElement = defineText({
  type: "heading",
  label: "Heading",
  icon: "heading",
  defaultStyles: { fontSize: "5xl", fontWeight: "bold", lineHeight: "tight", color: "#0a0a0a" },
  defaultData: { content: "Heading", tagName: "h2" },
  fields: [
    selectField({ name: "tagName", label: "Tag", options: ["h1", "h2", "h3", "h4", "h5", "h6", "p", "span"] }),
    textareaField({ name: "content", label: "Text", rows: 3 }),
  ],
});
