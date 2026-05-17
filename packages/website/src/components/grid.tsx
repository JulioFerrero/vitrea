import React from "react";
import type { ElementProps } from "@hi/render";
export function Grid({ element, className, style, children, attrs }: ElementProps) {
  return <div {...attrs} className={className} style={style}>{children}</div>;
}
