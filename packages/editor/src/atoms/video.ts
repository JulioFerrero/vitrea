import { defineMedia } from "../builders/elements";
import { urlField } from "../builders/fields";

export const videoElement = defineMedia({
  type: "video",
  label: "Video",
  icon: "play",
  defaultStyles: { maxWidth: "full" },
  defaultData: { src: "" },
  fields: [
    urlField({ name: "src", label: "Video URL" }),
  ],
});
