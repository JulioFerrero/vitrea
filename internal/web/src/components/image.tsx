import React from "react";
import type { ElementProps } from "@vitrea/render";

function ImageInner({ element, className, style, attrs }: ElementProps) {
  const d = element.data as { src?: string; alt?: string };
  return (
    <img
      {...attrs}
      src={d.src}
      alt={d.alt ?? ""}
      className={className}
      style={style}
      loading="lazy"
    />
  );
}

export const Image = React.memo(ImageInner);
