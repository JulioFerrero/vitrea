import React from "react";
import type { ElementProps } from "@hi/render";
export function Text({ element, className, style, attrs }: ElementProps) {
  const content = element.data.content;
  if (content && content.includes("<")) {
    return <div {...attrs} className={className} style={style} dangerouslySetInnerHTML={{ __html: content }} />;
  }
  return <p {...attrs} className={className} style={style}>{content ?? ""}</p>;
}
