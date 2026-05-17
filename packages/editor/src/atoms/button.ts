import { defineAction } from "../builders/elements";
import { textField, urlField } from "../builders/fields";

export const buttonElement = defineAction({
  type: "button",
  label: "Button",
  icon: "square",
  defaultStyles: {
    padding: "3",
    paddingX: "8",
    fontSize: "base",
    fontWeight: "semibold",
    backgroundColor: "#0a0a0a",
    color: "#ffffff",
    borderRadius: "lg",
  },
  defaultData: { content: "Click me", href: "#" },
  fields: [
    textField({ name: "content", label: "Text" }),
    urlField({ name: "href", label: "Link URL" }),
  ],
});
