import React from "react";
import type { ElementProps } from "@hi/render";
export function Divider({ element, className, style, attrs }: ElementProps) {
  return <hr {...attrs} className={className} style={style} />;
}
