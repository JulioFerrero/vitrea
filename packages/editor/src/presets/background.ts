import { defineStyleGroup, styleField } from "../builders/styles";
import { BACKGROUND_SIZE, BACKGROUND_POSITION } from "./tokens";

export const backgroundStyles = defineStyleGroup({
  label: "Background",
  fields: [
    styleField({ name: "backgroundColor", label: "Background Color", type: "color" }),
    styleField({ name: "backgroundImage", label: "Background Image", type: "text", placeholder: "url(...)" }),
    styleField({ name: "backgroundSize", label: "Background Size", options: BACKGROUND_SIZE }),
    styleField({ name: "backgroundPosition", label: "Background Position", options: BACKGROUND_POSITION }),
  ],
});
