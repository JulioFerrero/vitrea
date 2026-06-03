import type { ElementProps } from "@vitrea/render";
export function Row({ element: _element, className, style, children, attrs }: ElementProps) {
  return <div {...attrs} className={className} style={style}>{children}</div>;
}
