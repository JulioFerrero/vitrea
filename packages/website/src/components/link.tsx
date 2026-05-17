import React from "react";
import type { ElementProps } from "@hi/render";
export function Link({ element, className, style, attrs }: ElementProps) {
  return (
    <a
      {...attrs}
      href={element.data.href ?? "#"}
      target={element.data.target}
      className={className}
      style={style}
    >
      {element.data.content ?? element.data.href ?? ""}
    </a>
  );
}
