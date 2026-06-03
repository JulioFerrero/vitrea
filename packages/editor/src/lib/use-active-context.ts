import { useEditorStore } from "../stores";
import { useEditorContext } from "./context";
import { findElementById } from "@vitrea/render";

export function useActiveContext() {
  const activePageId = useEditorStore((state) => state.activePageId);
  const activeSiteId = useEditorStore((state) => state.activeSiteId);
  const content = useEditorStore((state) => state.content);
  const pages = useEditorStore((state) => state.pages);
  const selectedElementId = useEditorStore((state) => state.selectedElementId);
  const selectElement = useEditorStore((state) => state.selectElement);
  const { schema, actions } = useEditorContext();

  const selected = selectedElementId
    ? findElementById(content, selectedElementId)
    : null;

  const activePage = activePageId
    ? pages.find((page) => page.id === activePageId) ?? null
    : null;

  return {
    activePageId,
    activeSiteId,
    content,
    pages,
    selectedElementId,
    selected,
    activePage,
    selectElement,
    schema,
    actions,
  };
}
