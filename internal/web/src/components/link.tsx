import type { ElementProps } from "@vitrea/render";

export function Link({ element, className, style, attrs }: ElementProps) {
  const d = element.data as { href?: string; target?: string; content?: string };
  return (
    <a
      {...attrs}
      href={d.href ?? "#"}
      target={d.target}
      className={className}
      style={style}
    >
      {d.content ?? d.href ?? ""}
    </a>
  );
}
