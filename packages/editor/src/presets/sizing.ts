import { defineStyleGroup, styleField } from "../builders/styles";
import { WIDTH, HEIGHT, MAX_WIDTH, MIN_HEIGHT } from "./tokens";

export const sizingStyles = defineStyleGroup({
  label: "Size",
  fields: [
    styleField({ name: "width", label: "Width", options: WIDTH }),
    styleField({ name: "height", label: "Height", options: HEIGHT }),
    styleField({ name: "minHeight", label: "Min Height", options: MIN_HEIGHT }),
    styleField({ name: "maxWidth", label: "Max Width", options: MAX_WIDTH }),
  ],
});
