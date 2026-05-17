import React from "react";
import type { ElementProps } from "@hi/render";
export function Image({ element, className, style, attrs }: ElementProps) {
  return (
    <img
      {...attrs}
      src={element.data.src}
      alt={element.data.alt ?? ""}
      className={className}
      style={style}
      loading="lazy"
    />
  );
}
