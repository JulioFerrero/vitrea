import React from "react";
import type { ElementProps } from "@hi/render";
export function Html({ element, className, style, attrs }: ElementProps) {
  return <div {...attrs} className={className} style={style} dangerouslySetInnerHTML={{ __html: element.data.content ?? "" }} />;
}
