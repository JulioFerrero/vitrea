import React from "react";
import type { ElementProps } from "@hi/render";
export function Spacer({ element, className, style, attrs }: ElementProps) {
  return <div {...attrs} className={className} style={style} />;
}
