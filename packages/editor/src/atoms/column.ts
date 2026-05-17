import { defineContainer } from "../builders/elements";

export const columnElement = defineContainer({
  type: "column",
  label: "Column",
  icon: "columns-3",
  defaultStyles: { display: "flex", flexDirection: "col", gap: "2" },
});
