import { defineStyleGroup, styleField } from "../builders/styles";
import { OPACITY, OVERFLOW } from "./tokens";

export const effectsStyles = defineStyleGroup({
  label: "Effects",
  fields: [
    styleField({ name: "opacity", label: "Opacity", options: OPACITY }),
    styleField({ name: "overflow", label: "Overflow", options: OVERFLOW }),
  ],
});
