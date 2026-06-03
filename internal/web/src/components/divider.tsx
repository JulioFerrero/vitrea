import type { ElementProps } from "@vitrea/render";
export function Divider({ element: _element, className, style, attrs }: ElementProps) {
  return <hr {...attrs} className={className} style={style} />;
}
