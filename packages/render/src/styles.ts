export function classesFromStyles(styles: Record<string, unknown>): string {
  const classes: string[] = [];

  for (const [key, value] of Object.entries(styles)) {
    if (value == null || value === "") continue;
    const cls = styleToClass(key, String(value));
    if (cls) classes.push(cls);
  }

  return classes.join(" ");
}

function isHex(value: string): boolean {
  return value.startsWith("#");
}

function colorClass(prefix: string, value: string): string | null {
  if (isHex(value)) return null;
  return `${prefix}-${value}`;
}

function styleToClass(key: string, value: string): string | null {
  switch (key) {
    case "padding": return `p-${value}`;
    case "paddingX": return `px-${value}`;
    case "paddingY": return `py-${value}`;
    case "margin": return `m-${value}`;
    case "marginX": return `mx-${value}`;
    case "marginY": return `my-${value}`;
    case "width": return `w-${value}`;
    case "height": return `h-${value}`;
    case "minHeight": return `min-h-${value}`;
    case "maxWidth": return `max-w-${value}`;
    case "fontSize": return `text-${value}`;
    case "fontWeight": return `font-${value}`;
    case "fontFamily": return `font-${value}`;
    case "lineHeight": return `leading-${value}`;
    case "letterSpacing": return `tracking-${value}`;
    case "textAlign": return `text-${value}`;
    case "color": return colorClass("text", value);
    case "display": return value;
    case "flexDirection": return `flex-${value}`;
    case "justifyContent": return `justify-${value}`;
    case "alignItems": return `items-${value}`;
    case "gap": return `gap-${value}`;
    case "gridTemplateColumns": return `grid-cols-${value}`;
    case "borderRadius": return `rounded-${value}`;
    case "borderWidth": return value === "1" ? "border" : `border-${value}`;
    case "borderColor": return colorClass("border", value);
    case "borderStyle": return null;
    case "flexWrap": return value === "wrap" ? "flex-wrap" : value === "nowrap" ? "flex-nowrap" : value === "reverse" ? "flex-wrap-reverse" : null;
    case "backgroundColor": return colorClass("bg", value);
    case "backgroundSize": return `bg-${value}`;
    case "backgroundPosition": return `bg-${value}`;
    case "backgroundImage": return null;
    case "opacity": return `opacity-${value}`;
    case "overflow": return `overflow-${value}`;
    case "objectFit": return `object-${value}`;
    default: return null;
  }
}

export function inlineStylesFromTokens(styles: Record<string, unknown>): React.CSSProperties {
  const result: Record<string, string> = {};
  if (styles.backgroundImage) result.backgroundImage = String(styles.backgroundImage);
  if (styles.color && isHex(String(styles.color))) result.color = String(styles.color);
  if (styles.backgroundColor && isHex(String(styles.backgroundColor))) result.backgroundColor = String(styles.backgroundColor);
  if (styles.borderColor && isHex(String(styles.borderColor))) result.borderColor = String(styles.borderColor);
  return result as React.CSSProperties;
}
