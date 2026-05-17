import { defineMedia } from "../builders/elements";
import { urlField, textField } from "../builders/fields";

export const imageElement = defineMedia({
  type: "image",
  label: "Image",
  icon: "image",
  defaultStyles: { maxWidth: "full", objectFit: "cover" },
  defaultData: { src: "https://placehold.co/800x400/e5e5e5/999?text=Image", alt: "Image" },
  fields: [
    urlField({ name: "src", label: "Image URL" }),
    textField({ name: "alt", label: "Alt text" }),
  ],
});
