import { defineStyleGroup, styleField } from "../builders/styles";
import { BORDER_RADIUS, BORDER_WIDTH, BORDER_STYLE } from "./tokens";

export const borderStyles = defineStyleGroup({
  label: "Border",
  fields: [
    styleField({ name: "borderRadius", label: "Border Radius", options: BORDER_RADIUS }),
    styleField({ name: "borderWidth", label: "Border Width", options: BORDER_WIDTH }),
    styleField({ name: "borderColor", label: "Border Color", type: "color" }),
    styleField({ name: "borderStyle", label: "Border Style", options: BORDER_STYLE }),
  ],
});
