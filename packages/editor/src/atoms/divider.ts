import { defineUtility } from "../builders/elements";

export const dividerElement = defineUtility({
  type: "divider",
  label: "Divider",
  icon: "minus",
  defaultStyles: { marginY: "6" },
});
