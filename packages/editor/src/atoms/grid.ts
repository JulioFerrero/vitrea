import { defineContainer } from "../builders/elements";
import { selectField } from "../builders/fields";

export const gridElement = defineContainer({
  type: "grid",
  label: "Grid",
  icon: "grid-3x3",
  defaultStyles: { display: "grid", gap: "6", gridTemplateColumns: "2" },
  fields: [
    selectField({ name: "columns", label: "Columns", options: ["1", "2", "3", "4"] }),
  ],
});
