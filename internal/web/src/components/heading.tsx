import type React from "react";
import type { ElementProps } from "@vitrea/render";

const TAG_MAP: Record<string, string> = {
  h1: "h1", h2: "h2", h3: "h3", h4: "h4", h5: "h5", h6: "h6",
  p: "p", span: "span",
};

export function Heading({ element, className, style, attrs }: ElementProps) {
  const d = element.data as { tagName?: string; content?: string };
  const Tag = (TAG_MAP[d.tagName ?? "h2"] ?? "h2") as keyof React.JSX.IntrinsicElements;
  return <Tag {...attrs} className={className} style={style}>{d.content ?? ""}</Tag>;
}
