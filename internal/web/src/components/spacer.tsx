import type { ElementProps } from "@vitrea/render";
export function Spacer({ element: _element, className, style, attrs }: ElementProps) {
  return <div {...attrs} className={className} style={style} />;
}
