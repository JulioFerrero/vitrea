import React from "react";
import type { ElementProps } from "@hi/render";
export function Video({ element, className, style, attrs }: ElementProps) {
  return (
    <video
      {...attrs}
      src={element.data.src}
      controls
      autoPlay={element.data.autoPlay as boolean}
      loop={element.data.loop as boolean}
      className={className}
      style={style}
    />
  );
}
