import { defineText } from "../builders/elements";
import { textareaField } from "../builders/fields";

export const textElement = defineText({
  type: "text",
  label: "Text",
  icon: "type",
  defaultStyles: { fontSize: "base", lineHeight: "relaxed", color: "#374151" },
  defaultData: { content: "Write your text here." },
  fields: [
    textareaField({ name: "content", label: "Text", rows: 3 }),
  ],
});
