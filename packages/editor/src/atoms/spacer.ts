import { defineUtility } from "../builders/elements";

export const spacerElement = defineUtility({
  type: "spacer",
  label: "Spacer",
  icon: "move-vertical",
  defaultStyles: { height: "10" },
});
