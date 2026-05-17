import type { RenderElement } from "./types";

export function buildTree(flat: RenderElement[]): RenderElement[] {
  const map = new Map<string, RenderElement>();
  const roots: RenderElement[] = [];

  for (const el of flat) {
    map.set(el.id, { ...el, children: [] });
  }

  for (const el of flat) {
    const node = map.get(el.id)!;
    if (el.parentId && map.has(el.parentId)) {
      map.get(el.parentId)!.children!.push(node);
    } else {
      roots.push(node);
    }
  }

  const sortChildren = (nodes: RenderElement[]): RenderElement[] => {
    nodes.sort((a, b) => a.order - b.order);
    for (const n of nodes) {
      if (n.children?.length) sortChildren(n.children);
    }
    return nodes;
  };

  return sortChildren(roots);
}
