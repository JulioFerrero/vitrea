import { defineStyleGroup, styleField } from "../builders/styles";
import { FONT_SIZE, FONT_WEIGHT, FONT_FAMILY, LINE_HEIGHT, LETTER_SPACING, TEXT_ALIGN } from "./tokens";

export const typographyStyles = defineStyleGroup({
  label: "Typography",
  fields: [
    styleField({ name: "fontSize", label: "Font Size", options: FONT_SIZE }),
    styleField({ name: "fontWeight", label: "Font Weight", options: FONT_WEIGHT }),
    styleField({ name: "fontFamily", label: "Font Family", options: FONT_FAMILY }),
    styleField({ name: "lineHeight", label: "Line Height", options: LINE_HEIGHT }),
    styleField({ name: "letterSpacing", label: "Letter Spacing", options: LETTER_SPACING }),
    styleField({ name: "textAlign", label: "Text Align", options: TEXT_ALIGN }),
    styleField({ name: "color", label: "Color", type: "color" }),
  ],
});
