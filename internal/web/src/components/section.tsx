import type { ElementProps } from "@vitrea/render";
export function Section({ element: _element, className, style, children, attrs }: ElementProps) {
  return <section {...attrs} className={className} style={style}>{children}</section>;
}
