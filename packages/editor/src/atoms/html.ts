import { defineElement } from "../builders/elements";
import { textareaField } from "../builders/fields";

export const htmlElement = defineElement({
  type: "html",
  label: "HTML",
  icon: "code",
  category: "advanced",
  isContainer: false,
  defaultStyles: {},
  defaultData: { content: "<p>Custom HTML</p>" },
  fields: [
    textareaField({ name: "content", label: "HTML", rows: 5 }),
  ],
});
