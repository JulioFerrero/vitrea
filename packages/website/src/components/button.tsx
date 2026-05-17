import React from "react";
import type { ElementProps } from "@hi/render";
export function Button({ element, className, style, attrs }: ElementProps) {
  return (
    <a
      {...attrs}
      href={element.data.href ?? "#"}
      target={element.data.target}
      className={className}
      style={style}
    >
      {element.data.content ?? "Button"}
    </a>
  );
}
