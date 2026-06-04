export function applyOutline(el: HTMLElement | null, type: "hover" | "selected" | "none") {
  if (!el) return;
  if (type === "none") { el.style.outline = ""; el.style.outlineOffset = ""; }
  else if (type === "hover") { el.style.outline = "1px solid rgba(129, 140, 248, 0.5)"; el.style.outlineOffset = "-1px"; }
  else { el.style.outline = "2px solid #818cf8"; el.style.outlineOffset = "-1px"; }
}

export function queryElementAtPoint(
  wrapperRef: React.RefObject<HTMLDivElement | null>,
  transformRef: React.RefObject<{ x: number; y: number; scale: number }>,
  screenX: number,
  screenY: number
): { el: HTMLElement } | null {
  const wrapper = wrapperRef.current;
  if (!wrapper) return null;
  const iframes = Array.from(wrapper.querySelectorAll("iframe"));
  const transform = transformRef.current;
  if (!transform) return null;
  for (const iframe of iframes) {
    const rect = iframe.getBoundingClientRect();
    const px = (screenX - rect.left) / transform.scale;
    const py = (screenY - rect.top) / transform.scale;
    const doc = iframe.contentDocument;
    if (!doc) continue;
      const hit = doc.elementFromPoint(px, py)?.closest("[data-el-id]") as HTMLElement | null;
    if (hit) return { el: hit };
  }
  return null;
}

export function querySelectedOutline(
  wrapperRef: React.RefObject<HTMLDivElement | null>,
  selectedElementId: string | null
): HTMLElement | null {
  const wrapper = wrapperRef.current;
  if (!wrapper || !selectedElementId) return null;
  const docs = Array.from(wrapper.querySelectorAll("iframe"))
    .map((iframe) => iframe.contentDocument)
    .filter(Boolean) as Document[];
  for (const doc of docs) {
    const el = doc.querySelector(`[data-el-id="${selectedElementId}"]`) as HTMLElement | null;
    if (el) return el;
  }
  return null;
}
