import { defineContainer } from "../builders/elements";

export const sectionElement = defineContainer({
  type: "section",
  label: "Section",
  icon: "layout-dashboard",
  defaultStyles: { width: "full", padding: "20", paddingX: "6" },
});
