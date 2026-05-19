import { useEditorStore } from "../stores";
import { useEditorContext } from "./context";

export function useActiveContext() {
  const activePageId = useEditorStore((state) => state.activePageId);
  const activeSiteId = useEditorStore((state) => state.activeSiteId);
  const elements = useEditorStore((state) => state.elements);
  const pages = useEditorStore((state) => state.pages);
  const selectedElementId = useEditorStore((state) => state.selectedElementId);
  const selectElement = useEditorStore((state) => state.selectElement);
  const { schema, actions } = useEditorContext();

  const selected = selectedElementId
    ? elements.find((element) => element.id === selectedElementId) ?? null
    : null;

  const activePage = activePageId
    ? pages.find((page) => page.id === activePageId) ?? null
    : null;

  return {
    activePageId,
    activeSiteId,
    elements,
    pages,
    selectedElementId,
    selected,
    activePage,
    selectElement,
    schema,
    actions,
  };
}
