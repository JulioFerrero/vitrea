import type { ElementProps } from "@vitrea/render";
export function Html({ element, className, style, attrs }: ElementProps) {
  return <div {...attrs} className={className} style={style} dangerouslySetInnerHTML={{ __html: element.data.content ?? "" }} />;
}
