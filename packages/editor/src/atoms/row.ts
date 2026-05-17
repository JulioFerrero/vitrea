import { defineContainer } from "../builders/elements";

export const rowElement = defineContainer({
  type: "row",
  label: "Row",
  icon: "rows-3",
  defaultStyles: { display: "flex", flexWrap: "wrap", gap: "6" },
});
