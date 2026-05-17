import { defineStyleGroup, styleField } from "../builders/styles";
import { DISPLAY, FLEX_DIRECTION, JUSTIFY_CONTENT, ALIGN_ITEMS, FLEX_WRAP, GAP, GRID_COLUMNS } from "./tokens";

export const layoutStyles = defineStyleGroup({
  label: "Layout",
  fields: [
    styleField({ name: "display", label: "Display", options: DISPLAY }),
    styleField({ name: "flexDirection", label: "Flex Direction", options: FLEX_DIRECTION }),
    styleField({ name: "flexWrap", label: "Flex Wrap", options: FLEX_WRAP }),
    styleField({ name: "justifyContent", label: "Justify Content", options: JUSTIFY_CONTENT }),
    styleField({ name: "alignItems", label: "Align Items", options: ALIGN_ITEMS }),
    styleField({ name: "gap", label: "Gap", options: GAP }),
    styleField({ name: "gridTemplateColumns", label: "Grid Columns", options: GRID_COLUMNS }),
  ],
});
